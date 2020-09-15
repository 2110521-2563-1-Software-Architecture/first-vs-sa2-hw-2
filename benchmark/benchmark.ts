import GrpcClient from '../client/grpc_client';
import RestClient from '../client/rest_client';
import { Book, BookInterface } from '../client/BookInterface';

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


// benchmark(smallInsert);
// benchmark(largeInsert);
benchmark(concurrentInsert(1024));