import GrpcClient from '../client/grpc_client';
import RestClient from '../client/rest_client';
import { Book, BookInterface } from '../client/BookInterface';
import { createObjectCsvWriter } from 'csv-writer';

function getGrpcClient() {
    return new GrpcClient('127.0.0.1', 50051);
}

function getRestClient() {
    return new RestClient('http://localhost', 8080);
}

async function benchmarkOnce(fn: Function) {
    const grpc = getGrpcClient();
    let start = (new Date()).getTime();
    await fn(grpc);
    console.log('gRPC Response time:', (new Date()).getTime() - start, 'ms');

    const rest = getRestClient();
    start = (new Date()).getTime();
    await fn(rest);
    console.log('Rest Response time:', (new Date()).getTime() - start, 'ms');
}

async function smallInsert(client: BookInterface) {
    const book = {
        id: 1,
        title: 'test',
        author: 'test',
    }
    await client.insert(book);
}

async function largeInsert(client: BookInterface, book_count = 1000) {
    let books = [];
    for (let i = 0; i < book_count; i++) {
        books.push({
            id: i,
            title: '' + i,
            author: '' + i,
        })
    }
    await Promise.all(books.map(book => client.insert(book)));
}

function concurrentInsert(count: number) {
    return async function (client: BookInterface) {
        await largeInsert(client, count);
    }
}

async function concurrentList(client: BookInterface, count = 1000) {
    let p = [];
    for (let i = 0; i < count; i++) {
        p.push(client.list());
    }
    await Promise.all(p);
}

async function concurrentFind(client: BookInterface, count = 1000) {
    let p = [];
    for (let i = 0; i < count; i++) {
        p.push(client.findById(i));
    }
    await Promise.all(p);
}

async function cleanUp(client: BookInterface, count = 1000) {
    let ids = []
    for (let i = 0; i < count; i++) ids.push(i);
    await Promise.all(ids.map(id => async function () {
        try {
            await client.delete(id);
        } catch (err) { }
    }));
}

async function multipleClientBenchmark(max_count: 1000, step = 50) {
    const grpc1 = getGrpcClient();
    const grpc2 = getGrpcClient();
    // const grpc3 = getGrpcClient();
    const rest1 = getRestClient();
    const rest2 = getRestClient();
    // const rest3 = getRestClient();
    let results: any = [];

    for (let i = step; i <= max_count; i += step) {
        console.log('Testing with', i, 'calls');
        await cleanUp(grpc1, max_count);
        await cleanUp(rest1, max_count);
        let start = (new Date()).getTime();
        await Promise.all([
            largeInsert(grpc1, i),
            concurrentList(grpc2, i),
            // concurrentFind(grpc3, i),
        ]);
        const grpcTime = (new Date()).getTime() - start;

        start = (new Date()).getTime();
        await Promise.all([
            largeInsert(rest1, i),
            concurrentList(rest2, i),
            // concurrentFind(rest3, i),
        ]);
        const restTime = (new Date()).getTime() - start;

        results.push({
            times: i,
            grpc: grpcTime,
            rest: restTime,
        });

    }
    await writeCsv('./scenario_b.csv', results);
}

async function writeCsv(path: string, results: any) {
    const csvWriter = createObjectCsvWriter({
        path,
        header: [
            { id: 'times', title: 'times' },
            { id: 'rest', title: 'rest' },
            { id: 'grpc', title: 'grpc' },
        ]
    });
    await csvWriter.writeRecords(results);
}

async function benchmark(fn: Function, beforeEach: Function, max_count = 1000, step = 50) {
    const grpc = getGrpcClient();
    const rest = getRestClient();
    let results: any = [];

    for (let i = step; i <= max_count; i += step) {
        console.log('Testing with', i, 'calls');

        await beforeEach(grpc, max_count);
        await beforeEach(rest, max_count);

        let start = (new Date()).getTime();
        await fn(grpc, i);
        const grpcTime = (new Date()).getTime() - start;

        start = (new Date()).getTime();
        await fn(rest, i);
        const restTime = (new Date()).getTime() - start;

        results.push({
            times: i,
            grpc: grpcTime,
            rest: restTime,
        });
    }

    await writeCsv('./scenario_a.csv', results);
}

// Scenario A
// benchmark(largeInsert, cleanUp, 1000);

// Scenario B
// multipleClientBenchmark(1000, 50);

// Scenario C
// benchmark(concurrentList, async function (client: BookInterface) { 
//     await cleanUp(client, 200);
//     await largeInsert(client, 200);
// });
