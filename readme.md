# Likes

A simple Node-based server that manages likes across arbitrary web pages. Includes JavaScript code for clients that interfaces with the server. 

This is the server behind the likes feature on <a href="http://scripting.com/">Scripting News</a>. 

### The demo app

Full <a href="https://github.com/scripting/likes/tree/master/examples/demoApp">source</a> is provided for the <a href="http://scripting.com/code/nodelikes/client/">demo app</a>, of course. Please give it a try. 

Ask <a href="https://github.com/scripting/likes/issues">questions</a>. I want to nail this down as quickly as possible, so the sooner you spot problems the sooner they can be addressed.

There's a <a href="https://github.com/scripting/likes/tree/master/api">JavaScript API</a> for the browser. Please review it. Try creating your own app. Follow the example of the demo app. I've tried to make it clear. If you have questions, ask. That'll help me fill out the docs. 

### The Hello World app

There's an even simpler <a href="http://scripting.com/code/nodelikes/client/testing/">demo app</a> that's just enough to put up a bit of text with a like element adjacent to it. Here's the <a href="https://github.com/scripting/likes/tree/master/examples/helloWorld">source</a>. 

### Basic facts

We use Twitter for identity. We don't read anything from the user's Twitter account, or post anything to it, we use it  to know who's doing the liking. 

The server uses a SQL database to keep track of likes. Each like consists of three pieces of data, a URL, a screenname and a timestamp. If a user has liked a specific item there's a record in the database. If you unlike it, the record is removed. 

The URLs are up to the application. In the demo app, we construct the URL for each item based on the URL of the page followed by # followed by the name of a color. 

You are welcome to use <a href="http://likes.scripting.com/">my likes server</a>. The client software defaults to using that server, but you can override it.

If you want to run your own server, you have to create an app with Twitter. This used to be open to everyone, but they're making it harder. It's understandable, they have to try to get troll farms under control. But it seems this is a legitimate use of Twitter identity. 

### What does a Like mean?

It's a way to tell the author that you saw what they wrote and found it likeable. It doesn't mean you necessarily agree. You're also registering your presence to other people who read the blog. It's a way to say hi to the author and others who read the blog. (From a <a href="http://scripting.com/2018/11/17.html#a200227">post</a> on Scripting News.)

### API for the Node app

There are four calls, /toggle, /likes, /mylikes and /toplikes that provide the backend services your app needs.

1. /toggle takes three params, and oauthToken, oauthSecret and the URL of the thing that you are either liking or unliking. 

2. /likes takes a URL and returns a list of users who have liked it. It doesn't require oAuth access info.

3. /mylikes takes two params, and oauthToken, oauthSecret and returns an array of URLs the user has liked. 

4. /toplikes takes no params, and returns an array of most-liked items, in descending order. 

Look in the body of handleHttpRequest in <a href="https://github.com/scripting/likes/blob/master/server/likes.js">likes.js</a> for all the calls it responds to. 

Thejeshgn <a href="https://apps.thejeshgn.com/swagger-ui/?url=https://gist.githubusercontent.com/thejeshgn/f817ff92f87736fe3dfb8f3df496f8f8/raw/a185c70faa7d07dfb9e47422c93ce240a3ad2760/likes-api.yaml">wrote docs</a> for this API in an innovative way. Comment <a href="https://github.com/scripting/likes/issues/2">here</a>. 

