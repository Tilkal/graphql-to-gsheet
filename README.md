# graphql-to-gsheet
GraphQL requests beautifully presented in a Google Sheet

# Introduction 
This repository serves Google Apps Script (GAS) files that can be used within your own Google sheet editor to call upon Tilkal's GraphQL API and display data within your own Google sheet.

Table of contents
=================

<!--ts-->
   * [Introduction](#introduction)
   * [Table of contents](#table-of-contents)
   * [How it works](#how-it-works)
   * [Installation](#installation)
      * [STDIN](#stdin)
<!--te-->

# Prerequisites

# How it Works (for beginners)
Any google sheet can be used as a 'blank slate' to display data that is obtained from a GraphQL API. The way it works, or its brain is a normally hidden script editor which can store and run code. Let's try something very simple to make things clear. Ideas for this 'How it works' is due to [Ben Collin's blog](https://www.benlcollins.com/apps-script/google-apps-script-beginner-guide/).

1. Open a blank google sheet in your google drive
2. On the menu bar, navigate to `Tools` and then  `<>Script Editor` and click on it
3. You'll see an almost empty code editor like below. Code.gs is a Google Apps Script file. myFunction() is a function, which is now empty. Let's fill it in next.
  ![Empty_code_editor](/Images/gaseditor.png)
4. Write down the following code inside the myFunction function
  ![Hello-world_function](/Images/helloworld.png)
5. Now we need to save this function. If you try, you will likely be asked permissions like so. Grant it the required permissions.
  ![Seeking-permission](/Images/requirespermission.png)
6. Finally, we can run our function. Click on the run button (a black triangle under the publish button). When you click on this and go back to your google sheet, you should see the following Hello World popup like so. Et Voila! You've made your first GAS project! :) 
  ![HelloWorldpopup](/Images/hellowordbox.png)
