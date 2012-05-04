FuzzyToast Testing Server
=========================

To play around with FuzzyToast, you either need a browser that can work with an AJAX call to a `file://` URL, or you need to host this project. In case you don't have access to an Apache server (but you have installed [Node.js][]), I've created a simple web server (using [Express][]) for this purpose.

Setup and Installation
----------------------

To begin, install a copy of [Node.js][] on your system.

Check to see if your version of Node.js came with [NPM][] by running the following command:

    type npm

If not, install [NPM][]. This is usually done with the following command:

    curl http://npmjs.org/install.sh | sh

Finally, get the server's dependencies by running the following:

    npm install

You are now ready to rock.

Running the Server
------------------

To run this helper web server, simply run the following:

    node app.js

Finally, connect your browser to [`http://localhost:3000`][go] to see the wonder and magic.

  [Node.js]: http://www.nodejs.org
  [Express]: http://www.expressjs.com
  [NPM]: http://npmjs.org
  [go]: http://localhost:3000/
