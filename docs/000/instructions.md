# Day 1
Welcome... today, we are going to get NextJs set up and make sure that it works.  Then we are going to add our first OpenAI chat.  This includes a small change to the UI to show the prompt for the user and the results.  I'm also going to give you high-level guidance in testing the chat as an API directly.

## Disclaimer
This whole course is really for intermediate to advanced developers. You can make your way through it if you want to use vibe coding and not really understand what you're doing but I'm not going to help you with that. I'm going to give you directions that I believe an intermediate, relatively experienced developer can follow-- or investigate then follow; but they can keep up pretty easily. I'm not moving that fast and I'm kind of a high-level guy myself.

I'm using Cursor AI for all of this but you can use WindSurf, VS Code, or a text file.  No judging.  But you'll want to be able to use all of the AI goodness that Cursor, Windsurf, or VS Code gives you.  

** I will no be writing a single line of code and I'll be sharing all of my promts with you. **

Let's get [NextJS] (https://nextjs.org/) set up first.  
- First you have to make sure that you have the latest version of node on your machine (at least 18.8).
- in terminal run npx-create-next@latest.
    - Name it what you want (mine was ai-agent-course).
    - I used Typescript
    - I used ESLint
    - I'm not using Tailwind-- I'll be using MUI
    - src is yes
    - App Router is yes
    - Turbopack is no
    - import alias is no

Now you web application is set up and ready to run.  The above npx command also pulled down a bunch of depenencies under the node_module folder.  You can pull of a terminal in here with ctl - ~.  You can use an npm command there to start your app:  npm run dev.

Go to localhost:3000 to see the starter app.

## Time to code a lot with very little effort

Please be in Cursor.  If you are in a different AI Coding tool do the same thing in there.
1. Open up Chat with Cmd - L.
2. Make sure you are in Agent mode and using 3.7 Sonnet (or later).
3. Add this prompt (or make up a better one with this as a guide-- you can absolutely see that I purposefully "vibed" this prompt using my voice to show you that you can now this without a huge amount of planning):
- This is the Next.js app that I'm going to be using to demonstrate the development and use of AI agents, each of which are going to have their own API. To start, what I would like you to do is create a page in nextjs as a home page. You can alter the current one that's fine but that home page is really going to be a directory of what we have and then each of our agents is going to have their own page to show the prompts the necessary prompts and then the results so the first page the first API i want to do is a very simple open ai response so of course i'll need a dot env file and a dot env example file so i don't have to check in my dot env so that should go into git ignore and a simple Next.js page and under the api directory which needs to be created I'd like for you to create a generic folder api/generic and put simple chat response as the API and write the code for calling API with an open API key for just a simple response for whatever they prompt. 
4. Hit enter and watch it develop the home page, the page for a simple OpenAI chat prompt, the api code itself.
5. Go get an OpenAI key to use and put it in the .env file.
6. if you are still running the changes should be showing.  If not, you can stop (Ctl - C) and then run again "npm run dev".
7.  Navigate to your generic chat page and enter "Hi!".
8.  You should get a response back.