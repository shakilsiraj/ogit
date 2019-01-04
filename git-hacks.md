##Fetch

git -c core.quotepath=false -c log.showSignature=false fetch origin --progress --prune

##Sync

git -c core.quotepath=false -c log.showSignature=false merge origin/branch_name --no-stat -v

--no-stat:
Show a diffstat at the end of the merge. The diffstat is also controlled by the configuration option merge.stat.

With -n or --no-stat do not show a diffstat at the end of the merge.

-v
--verbose
Pass --verbose to git-fetch and git-merge.

##Pull

git -c core.quotepath=false -c log.showSignature=false pull --progress --no-stat -v --progress origin feature/develop

#Check if there is any commits that has not been pushed

git --no-pager diff orgin/master..HEAD
