---
title: 'Explain the TCP/IP Stack Like I’m 5'
pubDate: '2024-11-6'
---

This is what I wanted someone to do for me when I first started learning about networking. I wanted to understand the bigger picture first before getting bogged down by the details of different networking protocols. Unfortunately, most introductory courses tend to go into a bit too much detail, making it easy for clueless people like me to miss the forest for the trees. And so I hope to be able to explain the basics for someone else in this article.

For me, the best way to understand a topic you’re first getting into is through analogies. Analogies are important because they’re heuristics that tell you how to look for the instructions to understanding a topic, as opposed to algorithms that give you direct instructions. This is key to studying networking since it isn’t something like discrete math or calculus where everything seems clear-cut. Networking isn’t always straightforward, and for that reason, you can use analogies to open you to new schools of thought and validate your own understanding, seeing whether the analogies in your head still hold after diving deeper.

The analogy I’m going to use to explain what networking is all about is the process of **delivering a letter to someone**. This is what most books and courses also use because it’s essentially what you’re doing when you, for example, visit Facebook. It isn’t too hard to imagine this because at its core, the Internet is just a bunch of computers sharing stuff with each other. And in order for you to share something, you have to somehow deliver it to the person you want to share it with.

I’ll first give an analogy for each layer that’s supposed to show what it offers towards this goal of delivering a letter, and then discuss why I think the analogy makes sense in terms of the Internet / Internet protocols.

## The Application Layer
**analogy:** the language you speak in the letter

A crucial part of delivering a letter to someone is the language that you use when writing the letter. Nothing useful would get done if two parties couldn’t understand each other. Speaking the same language means that you can interpret what the other is saying, and that you respond according to how humans normally respond. For example, if you send a letter to someone asking how they are, assuming you both speak the same language, you can expect a reply that answers your question while also receiving the same question back (if they have common courtesy).

More concretely, the language you speak defines (1) the types of messages that can be exchanged, (2) the syntax of the message, (3) the semantics of the message, and (4) and what you do in response to certain messages. A comparison of a language like English and the HTTP protocol in terms of these definitions can be seen below.

![](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*PiRq5-BpcEyHLUAF_gS8qg.png)

Once you’re finished writing your letter, you enclose it in an envelope while also adding a note containing the room number of the recipient. Finally, you slip it under your door. As far as you’re concerned, this action of slipping it through your door is all you need to do for your letter to be delivered. The door then acts as a gateway to whatever mechanism magically delivers your letter. In the TCP/IP stack, this gateway from the application layer to the transport layer is known as a **socket**.

## The Transport Layer
**analogy:** a very kind cousin that collects letters from people in your house and hands them off to the postal service

Imagine that once you slip the envelope through the door, your kind cousin swoops in and picks it up. Next, they read the note you attached containing the room number, and write down both your room number as well as the recipient’s room number on the envelope. They do this for all the rooms in the house, and then proceed to give them to the postal service who is standing right outside your house.

The cousin needs to note the room numbers of both the sender and recipient because multiple people in each house also wish to exchange letters with others. This ensures the cousins in both houses know exactly which room to deliver the letters to. So when your house receives letters addressed to your room number, your cousin knows to slip them through your door as well.

In this sense, each house represents a computer because like houses that have people who want to communicate, a computer runs multiple applications that wish to do the same. When a computer receives a message from the Internet, it needs to route it to the application that it’s meant for, and a computer knows this by checking the destination port number attached to the message just like how your cousin would check the room numbers.

As the author of your letter, you also have the choice when it comes to what “kind” of cousin you’re going to ask to collect and deliver letters. If you don’t care too much about whether your letter gets to the recipient all in one piece, let alone whether it even arrives, you might want to stick to the cousin that provides you a no-frills service. They merely collect and route letters to and from the rooms. On the other hand, if your letter contains something important, you’d prefer to ask the cousin that provides services to reliably deliver it for you. This cousin synchronizes with the cousin in the recipient’s house so that your letters get delivered in order (assuming you send multiple). They also guarantee your letter arrives at its destination unscathed by asking the recipient’s cousin to acknowledge receipt. If this acknowledgment isn’t received within a certain time frame, the letter is resent.

If you’ve studied transport-layer protocols, it’s pretty obvious what these two cousins represent. The cousin that does the bare minimum is UDP, whereas the cousin that provides reliable letter-delivery and more is TCP.

## The Network Layer
**analogy:** the postal service

It’s important to note that the cousins never leave the house; the postal service is responsible for delivering the letter to its recipient. In this analogy, the postal service is different because it uses an IP address — a 32-bit value that indicates a device’s location on the internet rather than in the physical world. When the postal service receives the letter from your cousin, they also note the source and destination IP addresses on the envelope.

The postal worker delivering the letter doesn’t actually know the route to the destination, even if they have the destination IP address. They must rely on routers, which are like toll booth operators in this analogy. The worker consults these “toll booth operators” with the destination IP address to determine the best route — which highway or street to take — in order to reach the destination as quickly as possible. Throughout the process, the worker may need to consult several toll booth operators, each time using the destination IP address to guide them along the way.

But how do the “toll booth operators” know the shortest path? They need to understand the overall topology of the world to determine the best route. This is where routing protocols come in. Routing protocols can be thought of as algorithms developed by the postal service company and distributed to the toll booth operators. These algorithms calculate the least cost path from one location to the next and are sent to each toll booth. The toll booth operator then stores this information in a forwarding table, so when a postal worker asks for directions, they can accurately say, “For this address, this highway exit is the best one to take.”

## The Link Layer
**analogy:** the modes of transportation of the person carrying the envelope

The link layer is where the rubber meets the road. When the toll booth operator tells the postal worker which route to take next, it’s the vehicle they’re riding in that physically transports them through each segment. For example, if the path involves traveling from the Philippines to Singapore, then to India, the toll booth operator “reserves” different modes of transportation, such as a plane, car, or bus. The link layer is responsible for moving the worker across each transport segment (e.g., from the Philippines to Singapore) using the appropriate transportation mode (e.g., a plane). In this manner, the modes of transportation have a much more localized task than the postal service because they’re only in charge of moving the worker from one toll booth / house to the next.

This layer also manages the flow of traffic in a network, much like stoplights for cars or air traffic controllers for planes. Because the medium through which data travels (e.g., roads for cars, airspace for planes, or wireless signals for data) is shared among many users, an entity must regulate who can transmit at any given time to prevent collisions. In networking, this process is often handled by protocols that control access to the shared medium, ensuring orderly transmission. If two messages are sent at the same time or interfere with each other, like a car crash or a plane collision, the data can’t reach its destination, causing errors or delays in communication. Just as traffic accidents disrupt travel, data collisions cause transmission failures, requiring protocols to manage the flow efficiently and ensure successful delivery.

## Conclusion
In summary, understanding the TCP/IP stack through analogies can provide a clearer picture of how data moves across the Internet. Just like delivering a letter, the application layer ensures that the message is written in a way that both the sender and recipient can understand. The transport layer adds structure to the delivery, deciding which “cousin” is responsible for ensuring the message gets delivered reliably or not. The network layer takes on the critical role of figuring out how to get the letter from one point to another, navigating complex routes with the help of routers and routing protocols. Finally, the link layer ensures that the letter is physically transported across different segments, managing the flow of traffic to avoid collisions and ensure smooth delivery. Each layer plays an essential role, working together to guarantee that the message reaches its intended recipient as quickly and efficiently as possible. By breaking down the stack into relatable analogies, it becomes easier to grasp how the Internet functions as a whole, making networking concepts less intimidating and more accessible.