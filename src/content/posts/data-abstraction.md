---
title: 'Data Abstraction'
pubDate: '2024-05-14'
---

I’ve come to realize that one of the most important yet often overlooked topics about computer programming is the idea of abstraction. It’s a weird idea to me since it’s something you use to deal with holding complex ideas in your head, but the process of trying to understand it well enough to use it effectively is equally complex. Despite this, understanding just how to apply data abstraction in your code pays dividends in building more readable and maintainable systems.

## What exactly is data abstraction?
The general concept of abstraction is so broad that I think it deserves its own article. But when speaking of data in a program, abstraction can be defined as a design technique that allows you to separate **how a data object is used from how it’s made from more primitive data objects.**

A helpful way of thinking about this is to create data types that only exist in your mind, but not in the programming language. We’ve all used primitive data types one way or another. These are your `str`s, `int`s, and `bool`s in Python, or your strings, numbers, and booleans in TypeScript. But when using data abstraction, we want to work with the data types we create **without thinking about how they’re represented in memory**, that is, without worrying about whether they’re a number, or a string, or some other primitive. We’ll see why this is important a bit later.

## Abstraction Barriers: a Guide for Creating Data Abstractions
Introducing data abstraction in your code can be confusing at first. One way to start is to create an abstraction barrier. In my opinion, this is one of the most useful tools for creating data abstractions that I picked up from Dr. Brian Harvey’s UC Berkeley CS 61A lectures from 2010. It looks something like this:

![Figure 1](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*Uvz1-oXaiU_KUzmVYyRqLQ.png)

In the diagram, the abstract data type (ADT) is the data type that only exists in your mind and in the problem domain. It’s above the primitive data type/s in the diagram because it’s the only type we want other functions to “touch” whenever we want to manipulate the data type.

However, we still need functions to know about how the ADT is implemented. These are the selectors and constructors in the diagram. In fact, they’re the *only* functions that should know about how the ADT is implemented. Selectors are the functions that you use to select some part of your ADT. On the other hand, constructors are the functions that you use to create your ADT.

To make these ideas more concrete, allow me to reference an example from the *Structure and Interpretation of Computer Programs* book in terms of abstraction barriers.

## Example: Arithmetic Operations for Rational Numbers

Let’s say we wanted to create a program to perform arithmetic with rational numbers. The ADT would be a rational number, and the programs that use the ADT would be the functions to add, subtract, multiply, and delete rational numbers.

A good first step then is to think about how we might represent a rational number with primitives. There are two parts to a rational number — a numerator and a denominator, and so our primitive would need to be able to express these two parts as one entity. For the sake of simplicity, we can use an array of two values, and our constructor function would be:

```js
function makeRational(numerator, denominator) {
  return [numerator, denominator]; // the primitive is this array
}
```

Doing arithmetic with rational numbers entails selecting just one part of a rational number as the formulas for these operations require us to pick apart the operands and combine them in different ways:

![Figure 2](https://miro.medium.com/v2/resize:fit:944/format:webp/1*_mnKMfAfZ49IfLrBfefdNw.png)

We therefore need a way to retrieve just one value in the array — the first element to get the numerator, and the second element to get the denominator. Again, we wouldn’t want the functions that perform the arithmetic to know about how we implement our rational number, so we create selectors to do this job:

```js
function numer(rationalNumber) {
  return rationalNumber[0];
}

function denom(rationalNumber) {
  return rationalNumber[1];
}
```

With our selectors and constructors in place, we can start creating our arithmetic operations to work with our ADT. It’s a matter of creating a rational number with our constructor, and using our selectors to pick out numerators and denominators so we can combine them according to the formulas in Figure 2.

```js
function addRationals(rat1, rat2) {
    return makeRational(
      numer(rat1) * denom(rat2) + numer(rat2) * denom(rat1), 
      denom(rat1) * denom(rat2));
}

function subtractRationals(rat1, rat2) {
    return makeRational(
      numer(rat1) * denom(rat2) - numer(rat2) * denom(rat1),
      denom(rat1) * denom(rat2));
}

function multiplyRationals(rat1, rat2) {
    return makeRational(numer(rat1) * numer(rat2), denom(rat1) * denom(rat2));
}

function divideRationals(rat1, rat2) {
    return makeRational(numer(rat1) * denom(rat2), denom(rat1) * numer(rat2));
}
```

Before using our program, it can also be helpful to create a function to display our ADT how we expect them. We don’t think of rationals as two comma-separated numbers with square brackets on each end. We think of rationals as a numerator, followed by a forward slash, and then a denominator.

```js
function displayRational(rational) {
  console.log(numer(rational) + " / " + denom(rational));
}
```

And that’s it! We can start using our ADT and perform operations on them. Here’s an example:

```js
const oneHalf = makeRational(1, 2);
const oneThird = makeRational(1, 3);
const oneSeventh = makeRational(1, 7);

// adding 1 / 2 and 1 / 3
displayRational(addRationals(oneHalf, oneThird)); // "5 / 6"

// subtracting 1 / 2 from 1 / 7
displayRational(subtractRationals(oneHalf, oneSeventh)); // "5 / 14"
```

## Why Bother Using Data Abstraction and ADTs

You might be wondering why we went through all that trouble just to add and subtract values from two arrays. The answer is simple: **to make your code more maintainable and easy to change.**

My favorite way to explain how this works is to bring up abstraction in cars, the classic example for explaining abstraction.

A more generic definition of abstraction is the process of reducing complexity by hiding irrelevant details and only showing users the necessary information in order for them to use something. It’s easy to see how this translates to cars. As a driver, the only things you have to know how to use to start driving are the steering wheel, pedals, and the gear selector. This is because everything else about a car is abstracted away from you to make it easier for you to start driving. You don’t have to worry about what kind of engine your car has and how it works, or how gas makes your car move.

But what happens when these aren’t abstracted away from you? Suddenly, you *have to* know how your engine or transmission works in order to start using your car. You become dependent on the specific way your car’s manufacturer implemented some feature. This might not seem like a big deal since you can always get used to it — that is until you need to drive a new car. Another reason why abstraction in cars is so convenient is because regardless of the car manufacturer and model, every car can be driven the same, save for a few minor differences. You can buy a new car tomorrow and it wouldn’t take long for you to adjust even if the car’s inner workings were drastically different from your old car.

## Tying Everything Together
Going back to our rational number ADT example, we can mimic what swapping inner workings for another implementation would be like. We can try implementing our rational number using an object in JavaScript.

Let’s define functions to create an object, as well as to retrieve its values that are mapped to the keys zeroand one to create a scenario where we can’t access its first and second values using `[0]` and `[1]` like an array.

```js
function obj(x, y) {
    return { zero: x, one: y };
}

function zero(obj) {
    return obj.zero;
}

function one(obj) {
    return obj.one;
}
```

To swap them in, we merely need to change the functions that know about how our ADT is implemented, and every other function that manipulates the ADT would be oblivious to this change and would work the same.

```js
function makeRational(numerator, denominator) {
  return obj(numerator, denominator); // the primitive is now an object
}

function numer(rationalNumber) {
  return zero(rationalnumber);
}

function denom(rationalNumber) {
  return one(rationalNumber);
}
```

That wasn’t so bad. We were able to change our code without much effort because we isolated the code that knows about our implementation to just three functions.

However, if we didn’t take the time up front to use data abstraction, we might have implemented the arithmetic operation functions in a way that they know our rational number is actually an array, therefore becoming dependent on its implementation. For example, the addRationals function would be:

```js
function addRationals(rat1, rat2) {
    return makeRational(
      rat1[0] * rat2[1] + rat2[0] * rat1[1], 
      rat1[1] * rat2[1]);
}
```

And now if we swap the implementation from an array to an object once again, we would have to change all our arithmetic operation functions, and a total of four functions would be changed.

```js
function addRationals(rat1, rat2) {
    return makeRational(
      zero(rat1) * one(rat2) + zero(rat2) * one(rat1), 
      zero(rat1) * one(rat2));
}

// ...swap in the object implementations for the rest of the arithmetic functions
```

This isn’t far off from changing three functions in our short example, but you can imagine how much more tedious this would be in a larger system where there are significantly more functions that manipulate the entities in the system. You might have code that knows about the implementation of an entity scattered all over the code base, and you’d have to change every line.

## Conclusion
Data abstraction is a powerful design technique that makes code easier to maintain and change. It allows you to write low-level functions to deal with implementation entities, and then write high-level programs that are only concerned with the problem domain by manipulating real-world entities from there on out. If requirements change and we need to change how one entity is implemented, we would only need to update the few functions that are exposed to the primitives that make up the ADT.

Here are some tips for thinking about data abstraction in your programs:

- Think about what the real-world entity is in your program and only manipulate it as that entity and not how it’s implemented in terms of primitives.
- Decide what the underlying primitive for your ADT should be, and write a few focused functions that create your ADT and select parts from it to create a valid representation for your ADT.
- Reflect on what it would be like if the primitive for your ADT were to suddenly change.