---
title: 'Deleting Stale Branches on Azure DevOps with PowerShell and Python'
pubDate: '2024-06-6'
---

Version control systems are a part of every development team’s software development lifecycle. Developers push branches to the team’s remote repository to add new features, fix bugs, or to experiment. However, we often forget to delete branches we’re done with, and this clutters up repositories over time.

In this post, we will create a simple script to automate the process of deleting stale branches from Azure DevOps using PowerShell. We will also use Python to make choosing repositories to delete branches from more intuitive and user-friendly.

**NOTE:** You need to have Azure CLI, PowerShell, and Python installed on your system before starting.

## The PowerShell Script
The first thing we can add to our PowerShell script is a list of constant variables we can edit to change the behavior of the script:

- `EXCLUDE_BRANCHES` contains a list of common main / production branch names that we wouldn’t want to delete
- `PROJECT` is the name of the project in Azure DevOps that you would want to delete branches from
- `ORGANIZATION` is your organization’s URL in Azure
- `TTL` defines how old a branch must be (in days) before it’s considered stale. Branches older than this threshold may be deleted.
- `CUTOFF_DATE` computes the cutoff date to consider a branch stale — branches that were modified on or before the cutoff date will be deleted (set to 90 as a default to follow GitHub)

```powershell
$EXCLUDE_BRANCHES = $("development", "master", "main", "dev", "Development")
$PROJECT = "Project"
$ORGANIZATION = "https://dev.azure.com/Organization"
$TTL = 90
$CUTOFF_DATE = (Get-Date).AddDays(-$TTL)
```

Now, our script needs a way to authenticate itself in order to communicate with Azure DevOps. There are multiple ways you can do this. In this example, we will use the `Connect-AzAccount` command, as well as the `Get-AzAccessToken` to retrieve an access token we can use to hit Azure’s REST API. We will also contain all the logic inside a function.

For this to work, you’ll need to have an authenticated account you can use for your organization’s Azure DevOps server. You can then provide your username and password to create a credential object. For security purposes, it’s a good idea to set these as environment variables and just retrieve them from the script like we’re doing here.

```powershell
function Get-Token {
    $username = $($env:USER_NAME)
    $password = ConvertTo-SecureString -String $($env:PASSWORD) -AsPlainText -Force
    $credential = New-Object -TypeName System.Management.Automation.PSCredential ($username, $password)
}
```

Afterwards, we will use the credential object alongside our tenant ID (that we will also set as an environment variable) to connect our Azure account using `Connect-AzAccount` . Finally, we return the `Token` property of the token object we get back from calling `Get-AzAccessToken`.

```powershell
function Get-Token {
    # ... code to create the credential object
    Connect-AzAccount -Credential $credential -TenantId $($env:TENANT_ID)
    $token = Get-AzAccessToken
    return $token.Token
}
```

To use this token, we will create a global `headers` variable that we can call anywhere from our script whenever we need to make an HTTP request to Azure’s REST API.

```powershell
$headers = @{
        "Content-Type" = "application/json";
        "Authorization" = "Bearer $(Get-Token)"
}
```

We can now do the actual deleting after we’re authenticated. We need to create functions to (1) get all the refs in a repository, (2) loop through all the refs and only get those that are branches and aren’t in our `EXCLUDE_BRANCHES` constant, (3) attach the date each branch’s latest commit was last modified, (4) filter those branches to keep only those that are stale, and (5) delete the stale branches.

Getting the refs in a repository is straightforward since we can simply use the `az repos ref list` command provided by the Azure CLI. We will create a function that takes in the repository name and returns all its refs:

```powershell
function Get-RepoRefs {
        param (
                [string] $repo
        )
        $refs = az repos ref list `
                --project $PROJECT `
                --repository $repo `
                --organization $ORGANIZATION
                | ConvertFrom-Json

        return $refs
}
```

We can call this function from another function that loops through the list of refs and checks if the name of the ref is included in `EXCLUDED_BRANCHES`. If it is, we do nothing and move on to the next ref. But if it isn’t, we make a GET request to an Azure endpoint to get the details for a certain commit and create a new object that encapsulates the ref name and the date it was last modified. At the end of the function, we add it to a list of branches if the ref is a branch, and not any other kind of ref. All of this can be seen below:

```powershell
function Get-Branches {
        param (
                [string] $repo
        )
        $branches = @()
        $refs = Get-RepoRefs -repo $repo

        foreach ($ref in $refs) {
                if ($ref.name -replace "refs/heads/" -in $EXCLUDE_BRANCHES) {
                        continue
                }

                $url = "$($ORGANIZATION)/$([uri]::EscapeDataString($PROJECT))/_apis/git/repositories/$($repo)/commits/$($ref.objectId)?api-version=7.1-preview.1"

                try {
                        $commit_details = Invoke-RestMethod -Uri $url -Headers $headers -Method GET
                } catch {
                        Write-Host "Commit does not exist"
                }

                $current_branch = [PSCustomObject]@{
                        name = $ref.name
                        object_id = $ref.objectId
                        last_modified = $commit_details.push.date
                }

                if ($current_branch.name.Contains("refs/heads/")) {
                        $branches += , $current_branch
                }
        }

        return $branches
}
```

Once we have the branches of a repository, we can pass them to a function that filters out those that aren’t stale using the constants we defined earlier:

```powershell
function Get-StaleBranches {
        param (
                [array] $branches
        )

        $branches = $branches | Where-Object {
                ($_.last_modified) -lt ($CUTOFF_DATE)
        }

        return $branches
}
```

And now these stale branches will be passed into a function to delete each branch using `az repos ref delete`, and eventually write the status to the console.

```powershell
function Remove-StaleBranches {
        param (
                [string] $repo,
                [array] $stale_branches
        )

        foreach ($branch in $stale_branches) {
                $result = az repos ref delete `
                          --name $branch.name `
                          --object-id $branch.object_id `
                          --project $PROJECT `
                          --organization $ORGANIZATION `
                          --repository $repo |
                ConvertFrom-Json

                Write-Host $result.updateStatus
        }
}
```

Lastly, we will define and call a main method to outline the steps of our current workflow. In this case, the list of repositories will be passed into the script as an argument since they will come from another script, but you do have the option to just hard-code them into the script itself or in a configuration file.

```powershell

param(
        [string] $repositories
)

# ... all other code

function Main {
        $repos = $repositories -split ","

        foreach ($repo in $repos) {
                $branches = Get-Branches -repo $repo
                $stale_branches = Get-StaleBranches -branches $branches
                
                Write-Host "Deleting stale branches from $repo..."
                $stale_branches
                Remove-StaleBranches -repo $repo -stale_branches $stale_branches
        }       
}

Main
```

## The Python Script and Configuration File

The tool we’ll use to make selecting repositories more user-friendly is [Inquirer](https://pypi.org/project/inquirer/) — a third-party package which eases the process of prompting users for input. Before we install the package, you should create and activate a new virtual environment at the root of the project folder. Once you have it activated, you can install the package with:

```bash
pip install inquirer
```

To set up the Python script, we’ll create a Python file called `index.py` with some boilerplate code and imports.

```python
#!/usr/bin/env python

import inquirer
import subprocess
import json

if __name__ == "__main__":
    pass
```

We’ll also create a JSON file `config.json` to store the list of repositories we want to clean. The file will store the repositories in this format:

```json
{
    "repositories": [
        "FrontEnd",
        "Microservices",
        "DatabaseScripts",
        "Gateway"
    ]
}
```

You do have the option to get all the repositories in your organization using [Azure’s REST API endpoint](https://learn.microsoft.com/en-us/rest/api/azure/devops/git/repositories/list?view=azure-devops-rest-7.1&tabs=HTTP) if you want. But in this example, we’ll just maintain a list in the configuration file to reduce the number of network requests we make.

To get the repositories from the configuration file, we’ll just create a function to open the file and load the contents in JSON format:

```python
def get_repos():
    with open("config.json") as config_file:
        repos = json.load(config_file)
        
        return repos["repositories"]
```

The repositories we return from the previous function will be passed into a function to select the repositories. To allow users to select repositories to clean, we’ll use Inquirer to create a checkbox for each repository and prompt the user to select from the choices.

```python
def select_repos(repo_names):
    questions = [
        inquirer.Checkbox('repositories',
            message="Select repositories to delete stale branches from",
            choices=repo_names,
        ),
    ]

    repos = inquirer.prompt(questions)
    return repos["repositories"]
```

And similar to the main method we had in the PowerShell script, we’ll call these functions in the main method, and run the PowerShell script with the chosen repositories as an argument.

```python
if __name__ == "__main__":
    repos = get_repos()
    repos_to_clean = ",".join(select_repos(repos))
    subprocess.run(["pwsh", "delete.ps1", "-repositories", repos_to_clean])
```

## Executing the Script
Now that we have our scripts ready, we can execute the Python script to start selecting repositories. Make sure to give it executable permissions before running it.

```bash
./index.py
```

After executing the script, it should look something like this. You can press space to select a repository, and enter to proceed with the PowerShell script. If all goes well, stale branches should be deleted from your selected repositories.

![](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*HNp6I1uvr-3BlRmuEbjeeA.png)