document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.getSelected(null, function (tab) {
        var currentUrl = new URL(tab.url);
        const inputUrl = document.getElementById('aliaseInput');
        inputUrl.value = currentUrl.hostname;

        //redrow list 
        function drowList(links) {
            var linkListHtml = "";
            var i = 0;
            for (i = 0; i < links.length; i++) {
                if (links[i] === currentUrl.hostname) continue;
                linkListHtml += '<tr class="domain_row">'
                    + '<td class="link" link="' + links[i] + '">' 
                    + links[i] 
                    + '</td>'
                    + '<td><i class="remove material-icons color-u" link="' + links[i] + '">delete</i></td>'
                    + '</tr>'
            }
            const domainListElement = document.getElementById('domainList');
            domainListElement.innerHTML = linkListHtml;
        }

        //save change domainList
        function saveChange(domainList) {
            chrome.storage.sync.set(
                {domainList: domainList},
                function () {
                }
            );
        }
        // searching set by value
        function searchSetByValue(domainList, value) {
            var currentSetId;
            var currentUrlId;
            var empty = true;
            endloop:
                for (currentSetId = 0; currentSetId < domainList.length; currentSetId++) {
                    for (currentUrlId = 0; currentUrlId < domainList[currentSetId].length; currentUrlId++) {
                        if (domainList[currentSetId][currentUrlId] === value) {
                            empty = false;
                            break endloop;
                        }
                    }
                }
            if (empty) {
                currentSetId = -1;
            }
            return currentSetId;
        }

        chrome.storage.sync.get(
            ['domainList'], 
            function (result) {
                var domainList = result.domainList;
                var currentSetId = searchSetByValue(domainList, currentUrl.hostname)
                if (currentSetId < 0) {
                    currentSetId = domainList.length;
                    domainList.push([currentUrl.hostname])
                }

                drowList(domainList[currentSetId]);
               
                //add button action
                document.getElementById('addButton').addEventListener('click', function () {
                    var inputValue = inputUrl.value;
                    if (inputValue === currentUrl.hostname) {
                        return;
                    }
                    var targetSetId = searchSetByValue(domainList, inputValue)
                    if (targetSetId < 0) {
                        domainList[currentSetId].push(inputValue)
                        saveChange(domainList)
                        drowList(domainList[currentSetId]);
                        return;
                    }
                    domainList[currentSetId] = domainList[currentSetId].concat(domainList[targetSetId]);
                    domainList.splice(targetSetId, 1);
                    currentSetId--;
                    saveChange(domainList)
                    drowList(domainList[currentSetId]);
                })        
                //row action
                document.getElementById('domainList').addEventListener('click', function (e) {
                    if (e.target.classList.contains('link')) {
                        chrome.tabs.update(
                            tab.id, 
                            {url: tab.url.replace(currentUrl.hostname, e.target.getAttribute('link'))}
                        )
                    } else if(e.target.classList.contains('remove')) {
                        domainList[currentSetId].splice(domainList[currentSetId].indexOf(e.target.getAttribute('link')), 1);
                        saveChange(domainList);
                        drowList(domainList[currentSetId]);
                    }
                })
            }
        );
    })
});
