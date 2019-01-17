##Fetch

`git -c core.quotepath=false -c log.showSignature=false fetch origin --progress --prune`

##Sync

`git -c core.quotepath=false -c log.showSignature=false merge origin/branch_name --no-stat -v`

--no-stat:
Show a diffstat at the end of the merge. The diffstat is also controlled by the configuration option merge.stat.

With -n or --no-stat do not show a diffstat at the end of the merge.

-v
--verbose
Pass --verbose to git-fetch and git-merge.

##Pull

`git -c core.quotepath=false -c log.showSignature=false pull --no-stat -v --progress origin feature/develop`

conflict example:

Removing express/spec/server.spec.ts
Removing express/spec/middleware/UserAuthSpec.js
Auto-merging angular/apps/client/src/app/bottal-page/bottal-page/components/inte
nt-edit/intent-edit.component.ts
CONFLICT (content): Merge conflict in angular/apps/client/src/app/bottal-page/bo
ttal-page/components/intent-edit/intent-edit.component.ts
Auto-merging angular/apps/client/src/app/bottal-page/bottal-page/components/inte
nt-edit/intent-edit.component.html
CONFLICT (content): Merge conflict in angular/apps/client/src/app/bottal-page/bo
ttal-page/components/intent-edit/intent-edit.component.html
Automatic merge failed; fix conflicts and then commit the result.

#Check if there is any commits that has not been pushed

`git --no-pager diff orgin/master..HEAD`

#Check if there is any merge conflicts

`git diff --name-only --diff-filter=U`

# Merge two remote repos

`git fetch origin -p`
`git checkout -b branch1 origin/branch1`
`git checkout -b branch2 origin/branch2`
`git merge --no-ff branch1`

fix all the merge conflicts!

`git push origin HEAD:branch2`

# Reset local repo to a specific branch

Clean the repo first:
`git clean -f -d -x`

Fetch remote changes:
`git fetch -p`

Reset to a specific branch:
`git reset --hard origin/master`
