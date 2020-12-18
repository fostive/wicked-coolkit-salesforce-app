# Weirdos Salesforce App

## Local Dev Setup

1. Install sfdx CLI using the [installer](https://developer.salesforce.com/tools/sfdxcli) or `npm install --global sfdx-cli`
1. `git clone` this repo and `cd` into its directory
1. `sfdx force:auth:web:login --setalias=WeirdosDevHub --setdefaultdevhubusername` to authenticate with a Dev Hub Salesforce org I've already created. It will open a browser window asking you to login. You should have received an email with credentials for this.
1. `sfdx force:org:create -f config/project-scratch-def.json --setalias weirdosscratch --durationdays 30 --setdefaultusername` to create an empty scratch org. This will be your "local" (and easily disposable) dev environment.
1. `sfdx force:source:push` to deploy the code in this directory to the scratch org you just created.
1. ~~`sfdx force:data:tree:import --plan ./data/data-plan.json` to add some sample data to the scratch org.~~ I can't figure out how to export the sample data in a format that can be imported. In the meantime, you'll have to generate some sample data manually (you should only have to do this once). Run `sfdx force:org:open`, click the "9 dot" icon in the top left, click "Sales". Now you should be able to click the "Contact" tab drop-down and then click "New Contact". Fill in first name, last name, bio, and maybe one social network URL. Click Save. Now click the "Related" tab for that contact record you just created. Scroll down and you should see a "New" button in the Websites pane. Click that to add a website and associate it with that contact. You can do the same in the Stickers pane, but first you'll have to add sticker records using the Sticker tab at the very top.
1. `sfdx force:user:password:generate` to generate a password to use with jsforce as described below. Use the username and password it outputs with the code below.

## Use Local Dev Setup

Now you can use the [jsforce](https://jsforce.github.io) library to do CRUD operations (among other things) against the sample data. You'll need to do something like ths to get a `conn` object which you can then use to make [CRUD](https://jsforce.github.io/document/#crud) or [SOQL Query](https://jsforce.github.io/document/#query) requests.

```javascript
var jsforce = require('jsforce');
var conn = new jsforce.Connection({
  // you can change loginUrl to connect to sandbox or prerelease env.
  loginUrl : 'https://test.salesforce.com'
});
conn.login(username, password, function(err, userInfo) {
  if (err) { return console.error(err); }
  // Now you can get the access token and instance URL information.
  // Save them to establish connection next time.
  console.log(conn.accessToken);
  console.log(conn.instanceUrl);
  // logged in user property
  console.log("User ID: " + userInfo.id);
  console.log("Org ID: " + userInfo.organizationId);
  // ...
});
```

Now use the instructions to make [CRUD](https://jsforce.github.io/document/#crud) or [SOQL Query](https://jsforce.github.io/document/#query) requests.

## TODO

- [ ] Figure out how to export sample data as a plan so that it can be imported
- [ ] Create app in Salesforce app launcher
- [ ] Configure Salesforce UI for Weirdos-specific use cases e.g. fillinig out tradnig card contact info, creating a website and associating it with your tradinig card, adding stickers to trading card, creatinig a webring, adding websites to a webring.

## General Information About Salesforce DX Projects

Now that you’ve created a Salesforce DX project, what’s next? Here are some documentation resources to get you started.

## How Do You Plan to Deploy Your Changes?

Do you want to deploy a set of changes, or create a self-contained application? Choose a [development model](https://developer.salesforce.com/tools/vscode/en/user-guide/development-models).

## Configure Your Salesforce DX Project

The `sfdx-project.json` file contains useful configuration information for your project. See [Salesforce DX Project Configuration](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_ws_config.htm) in the _Salesforce DX Developer Guide_ for details about this file.

## Read All About It

- [Salesforce Extensions Documentation](https://developer.salesforce.com/tools/vscode/)
- [Salesforce CLI Setup Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_setup.meta/sfdx_setup/sfdx_setup_intro.htm)
- [Salesforce DX Developer Guide](https://developer.salesforce.com/docs/atlas.en-us.sfdx_dev.meta/sfdx_dev/sfdx_dev_intro.htm)
- [Salesforce CLI Command Reference](https://developer.salesforce.com/docs/atlas.en-us.sfdx_cli_reference.meta/sfdx_cli_reference/cli_reference.htm)
