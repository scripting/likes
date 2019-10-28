* 12/2/18; 10:59:14 AM by DW
   * Releasing yesterday's changes.
      * set up weblikes.org
      * moved the hello world app to a new location to reflect its purpose
         * must update links on the home page
      * changed the includes to use the CDN links through the GitHub repo, instead of pointing to the development versions. 
      * wrote change notes on Scripting News. 
* 12/1/18; 9:57:28 AM by DW
   * Reorganize the repo
      * New top level folder -- api
         * contains likes.js and likes.css, the files you include in browser-based apps
      * New top level folder -- examples
         * Sub-folders -- helloWorld and demoApp
   * A very simple Hello World likeable app
      * The first demo was not minimal. This app has a single line of text that can be liked. It uses the API to access the server. 
   * New options for nodeLikesApp, options.addTheWordLikes.
      * If true, we add the word "likes" after the count. Default false.
      * I decided after a while on Scripting News to drop the word <i>likes</i> after the count, because it's redundant, people quickly learn what the thumb followed by a count means. 
   * Removed font-size from spLikes
      * It should by default inherit the font size from the object it's contained in. 
   * New CSS for divLikeContainer, it's now an inline-block.
      * This allows it to follow on the same line as the item it's liking. 
      * If you want it to float, just override divLikeContainer in your own CSS. 
   * New option for nodeLikesApp, option.flPrepend. 
      * If true, we prepend the Likes container in each .likeable element, if false or not specified we append. 
      * This keeps it simple if you just want the Like functionality to follow the item that's being liked. This is the usual case imho.
* 11/30/18; 12:00:10 PM by DW
   * Todo
      * Include Twitter oauth call in the API docs. It's an important piece. 
* 11/24/18; 11:48:23 AM by DW
   * Added new feature to the home page of <a href="http://likes.scripting.com/">likes.scripting.com</a> showing the most-liked items in descending order. A new corresponding enpoint was implemented in the server, /toplikes. Documented it as the fourth <a href="https://github.com/scripting/likes#api-for-the-node-app">API endpoint</a> of the Likes server.
   * Option to save the contents of the database every night in JSON on the local disk.
* 11/23/18; 11:16:51 AM by DW
   * Changed the name at the top of the readme to Likes. The software internally refers to itself as nodeLikes. It's awkward in other places and since there is no NPM package for this software, unnecessary. I would like to call it Web-Likes to refect its a connection to the open web.
   * Added docs for the /mylikes call, and fixed the docs for /toggle. It said you needed an accessToken, this was shorthand for the two bits of info that make up a token. I made that clearer for both /toggle and /mylikes.
   * I also added a new element to the Source namespace, source:likes, which provides the URL of a Likes server for a feed reader to hook into.
* 11/18/18; 9:51:25 AM by DW
   * Next up
      * Add link to Like URL in the RSS feed for Scripting News, with a note explaining how a reader could interpret it if they want to.
* 11/17/18; 11:06:04 AM by DW
   * v0.4.8
      * remove dependency on daves3, we don't actually use it.
      * change value of config.urlServerHomePageSource to point to the new version of the home page for the likes server. 
      * likes server returns a favicon
   * a page that shows me the URLs of things I liked
      * the home page of likes.scripting.com
      * the new home page is <a href="http://scripting.com/code/nodelikes/serverhomepage/">here</a>. 
      * need a bit of extra room to add some code to it. 
      * it's no longer just a placeholder.
* 11/16/18; 11:25:28 AM by DW
   * Make it so that accessing / on a likes server returns something.  
      * I have it configured to return <a href="http://scripting.com/code/nodelikes/myhomepage.html">this HTML</a>, but it can be changed in config.json.
   * Wrote <a href="https://github.com/scripting/likes#api-for-the-node-app">docs</a> for the API for the Node app.
   * Announced on <a href="http://scripting.com/2018/11/16.html">Scripting News</a>.
* 11/15/18; 3:03:01 PM by DW
   * Getting first public release ready.
   * work on &lt;head> section of the demo app, reduce the number of dependencies to a minimul
