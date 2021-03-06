# React with Redux Example App


## To run the app locally:

Install Node.js: [https://nodejs.org/en/](https://nodejs.org/en/)

Clone the repo into a directory: 

#### `git clone https://github.com/liz/react-example.git`

In the project directory, you can run:

#### `npm install`

To install dependencies 

After dependencies are installed in the project directory, you can run:

#### `npm start`

Runs the app in the development mode.
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.
You will also see any lint errors in the console.

## To run tests locally:

#### `npm test`

Launches the test runner in the interactive watch mode. This currently has about 115 passing tests for me.

## Task:
Create a simple interface with two screens:

* Initial screen to enter a [github API Token](https://github.com/settings/tokens)
* After submitting an accepted token, list the user's repos on the left side of the screen. After selecting a repo on the left side of the screen, list the repo's issues in a sortable table (in desktop, these stack in mobile)

Sort order and sort direction should be saved in the user's session and stay after refresh

## This is:
* Basic react app setup with [Create React App](https://github.com/facebook/create-react-app)
* `index.js` pulls in `app.js`, wraps it in the redux store `Provider`
* `app.js` will take you to `SaveKey` to enter an apiKey, if your apiKey has been entered and github accepts it, it will take you to `Listing` to list your repos (if github does not accept your key, it will respond with an error and ask you to enter a different key)
* `listing.jsx` lists your repos. If you select a repo in `listing.jsx`, it will load `issue-listing.jsx` with your `selectedRepo`'s issues listed in a sortable table (if github responds with no issues/an error, it will tell you "Github cannot find any issues for this repo")
* If you refresh, you'll see your last chosen sorting options, with the same repo selected -- this is set and set with `window.sessionStorage`. It is tested with `jest-localstorage-mock`
* `reducers.js` and `actions.js` use Redux to save the user's API key entered on the first screen
* For the layout this project includes a few basic reusable components like `Button`, `Image`, and `Container`. It includes a very small bit of utility SCSS in `utils.scss`. 
* For a project any larger than this, instead of using grid components created above and the small `utils.scss` file, I'd most likely import a select few pieces of the bootstrap 4 grid and SCSS utilities into the SCSS and use the bootstrap 4 grid and utilities for the grid, responsiveness, and spacing in the project. I've written some small styled-components components for this project to show I can make a grid/responsive layout from scratch without the assistance of a framework. But anything larger I'd probably just use select bits of bootstrap 4 and not re-invent components/style utility classes what they have already made.
* Theres a mix of functional and class components, all could be changed to functional components if that's desired. In general in terms of coding style/syntax I tend to follow the patterns I see if I am working in a project that already exists to stay consistent with the project and can learn and follow new patterns if any patterns are seen in this project that are not desired.

## Screenshots of this when I run it locally in chrome:
###### Desktop on load:
![image](https://user-images.githubusercontent.com/3377/71938575-bc11df80-3164-11ea-9613-0eb748906acb.png)

###### Mobile on load:
![image](https://user-images.githubusercontent.com/3377/71938587-c8963800-3164-11ea-8117-a4365b3ede2a.png)

###### Button enables when field is not empty:
![image](https://user-images.githubusercontent.com/3377/71750967-e4c96a80-2e2e-11ea-8ec2-7160db78145a.png)

###### Error response when Github responds with an error:
![image](https://user-images.githubusercontent.com/3377/71751046-28bc6f80-2e2f-11ea-8934-1baa35601de9.png)

###### Desktop when github responds with repo results:
![image](https://user-images.githubusercontent.com/3377/71751065-37a32200-2e2f-11ea-8006-4fe45b11dd86.png)

###### Mobile when github responds with repo results:
![image](https://user-images.githubusercontent.com/3377/71751081-47bb0180-2e2f-11ea-9203-46be6d4e2450.png)

###### Desktop when a repo is selected from the "Select a Repo" list list and the repo has issues:
![image](https://user-images.githubusercontent.com/3377/71751104-573a4a80-2e2f-11ea-93b8-b3d3f6d37c66.png)

###### Mobile when a repo is selected from the "Select a Repo" list and the repo has issues:
![image](https://user-images.githubusercontent.com/3377/71751292-efd0ca80-2e2f-11ea-9e10-ae7d838769c5.png)

###### When github responds with an error when looking for issues for the repo (like if the repo has no issues):
![image](https://user-images.githubusercontent.com/3377/71751138-72a55580-2e2f-11ea-8d92-f8d6c632a88d.png)

###### When the user has selected a different sort order/sort direction (different than the default of created/desc), and refreshes the page and looks a the issues for a repo in the same browser session, they see the different sort order/sort direction in desktop:
![image](https://user-images.githubusercontent.com/3377/71851635-d7f58280-308b-11ea-8d69-f7c6af65279a.png)

###### When the user has selected a different sort order/sort direction (different than the default of created/desc), and refreshes the page and looks a the issues for a repo in the same browser session, they see the different sort order/sort direction in mobile:
![image](https://user-images.githubusercontent.com/3377/71851657-e5127180-308b-11ea-8cdc-6883d7ef2909.png)

## IE 11 compatibility:
While locally testing, ran into some issues with react-create-app's scripts in IE 11:
https://github.com/facebook/create-react-app/issues/8084 / https://github.com/facebook/create-react-app/issues/8153
For now using the 3.2.0 version of `react-scrips` works for loading IE 11 locally.

###### Initial screen in IE 11 on browserstack:
![image](https://user-images.githubusercontent.com/3377/71693893-77500800-2d62-11ea-8e03-5c80a1e05d24.png)

###### Listing screen in IE 11 on browserstack:
![image](https://user-images.githubusercontent.com/3377/71693939-92227c80-2d62-11ea-8744-4ddef05c54d5.png)

###### Listing screen in IE 11 on browserstack when a repo has been selected:
![image](https://user-images.githubusercontent.com/3377/71751395-45a57280-2e30-11ea-9ed0-090c9be8c96b.png)
