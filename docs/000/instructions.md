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