document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.getSelected(null, function (tab) {
        console.log('!');
        var currentUrl = new URL(tab.url);
        const inputUrl = document.getElementById('aliaseInput');
        inputUrl.value = currentUrl.hostname;

        //redrow list 
        function drowList(links) {
            var linkListHtml = "";
            var i = 0;
            for (i = 0; i < links.length; i++) {
                if (links[i] === currentUrl.hostname) continue;
                linkListHtml += '<div>'
                    + '<span class="link" link="' + links[i] + '">' 
                    + links[i] 
                    + '</span>'
                    + '<span class="remove" link="' + links[i] + '">x</span>'
                    + '<div>'
            }
            const domainListElement = document.getElementById('domainList');
            domainListElement.innerHTML = linkListHtml;
        }

        //save change domainList
        function saveChange(domainList) {
            chrome.storage.sync.set(
                {domainList: domainList},
                function () {
                    console.log('set data')
                }
            );
        }

        chrome.storage.sync.get(
            ['domainList'], 
            function (result) {
                console.log(result);
                var domainList = result.domainList;
                console.log(domainList);
                var currentSetId, currentUrlId;
                var empty = true;
                console.log(currentSetId);
                endloop:
                    for (currentSetId = 0; currentSetId < domainList.length; currentSetId++) {
                        for (currentUrlId = 0; currentUrlId < domainList[currentSetId].length; currentUrlId++) {
                            if (domainList[currentSetId][currentUrlId] === currentUrl.hostname) {
                                empty = false;
                                console.log(currentSetId);
                                console.log(currentUrlId);
                                break endloop;
                            }
                        }
                    }
                console.log(currentSetId);
                console.log(empty);
                if (empty) {
                    console.log('new row');
                    currentSetId = domainList.length; currentUrlId = 0;
                    domainList.push([currentUrl.hostname])
                }
                console.log(currentSetId);

                drowList(domainList[currentSetId]);
                
                document.getElementById('addButton').addEventListener('click', function () {
                    var inputValue = inputUrl.value;
                    console.log(inputValue);
                    if (inputValue === currentUrl.hostname) {
                        return;
                    }
                    domainList[currentSetId].push(inputValue)
                    saveChange(domainList)
                    drowList(domainList[currentSetId]);
                })        
                document.getElementById('domainList').addEventListener('click', function (e) {
                    console.log(e.target);          
                    if (e.target.classList.contains('link')) {
                        console.log('move to' + e.target.getAttribute('link'));
                        //currentUrl.hostname.replace(e.target.getAttribute('link'));
                        chrome.tabs.update(
                            tab.id, 
                            {url: tab.url.replace(currentUrl.hostname, e.target.getAttribute('link'))}
                        )
                    } else if(e.target.classList.contains('remove')) {
                        //var index = array.indexOf(item);
                        //if (index !== -1) array.splice(index, 1);
                        domainList[currentSetId].splice(domainList[currentSetId].indexOf(e.target.getAttribute('link')), 1);
                        saveChange(domainList);
                        drowList(domainList[currentSetId]);
                        console.log('remove' + e.target.getAttribute('link'));
                    }
                })
            }
        );
    })
});
