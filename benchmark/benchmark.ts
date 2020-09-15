import GrpcClient from '../client/grpc_client';
import RestClient from '../client/rest_client';
import { BookInterface } from '../client/BookInterface';

function getGrpcClient() {
    return new GrpcClient('127.0.0.1', 50051);
}

function getRestClient() {
    return new RestClient('http://localhost', 8080);
}

async function benchmark(fn: Function) {
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

async function multipleClientBenchmark() {
    const grpc1 = getGrpcClient();
    const grpc2 = getGrpcClient();
    let start = (new Date()).getTime();
    await Promise.all([largeInsert(grpc1, 500), concurrentList(grpc2, 500)]);
    console.log('gRPC Response time:', (new Date()).getTime() - start, 'ms');

    const rest1 = getRestClient();
    const rest2 = getRestClient();
    start = (new Date()).getTime();
    await Promise.all([largeInsert(rest1, 500), concurrentList(rest2, 500)]);
    console.log('Rest Response time:', (new Date()).getTime() - start, 'ms');
}


// benchmark(smallInsert);
// benchmark(largeInsert);
// benchmark(concurrentInsert(1024));
// multipleClientBenchmark();