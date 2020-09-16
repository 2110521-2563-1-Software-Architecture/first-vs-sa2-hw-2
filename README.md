# first-vs-sa2-hw-2

## Member

1. Anan Methasate 6031061021
2. Nisaruj Rattanaaram 6031033521
3. Thaworn Kangwansinghanat 6030226121
4. Sorawit Sunthawatrodom 6031057621
5. Narin Trakarnvanich 6030320421
6. Nathaphum Niyomsathien 6031014621

## Graphs showing the benchmarking results with the explanation of your experimental settings

> TODO

We benchmarked the performance of gRPC and REST by simulating three scenarios:

1. Single client with a small call to insert a book item, a bigger call to insert a list of multiple book items.
2. Multiple clients with different kind of calls
3. Vary the number of concurrent calls from 1 to 4096 calls.

The performance of each scenario was measured by response time in millisecond.

## Discussion of the results why one method is better the other in which scenarioss

From the results, gRPC gives better performance in every scenarios because HTTP/1.1 which is used by REST isn't support concurrent requests. In the other hand, HTTP/2 (gRPC) natively supports request multiplexing which can handle incoming requests asynchronously. HTTP/2 also has better header compression methods which make gRPC send the payload faster.

## Comparison of the gRPC and REST API from the aspects of language neutral, ease of use, and performance

### Language Neutral

REST is more flexible compared to gRPC. REST supports every type of environment while gRPC only supports popular programming languages. There would be some unsupported environment problems when you use gRPC.

### Ease of use

The gRPC code is shorter than REST. However, gRPC has larger learning curve and harder to debug. Community are more familiar with REST since gRPC is still new. They will give a better support when you have a problem about REST.

### Performance

Since REST uses HTTP/1 by default while gRPC uses HTTP/2 which is significantly faster.

## Does your results comply with the results in [Medium Article](https://medium.com/@bimeshde/grpc-vs-rest-performance-simplified-fd35d01bbd4?)? How?

> TODO
