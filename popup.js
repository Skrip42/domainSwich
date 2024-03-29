document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.getSelected(null, function (tab) {
        var currentUrl = new URL(tab.url);
        const inputUrl = document.getElementById('aliaseInput');
        inputUrl.value = currentUrl.hostname;

        //redrow list 
        function drowList(links) {
            var linkListHtml = "";
            var i = 0;
            if (typeof links === "undefined" || links.length < 2) {
                linkListHtml += '<tr><td class="color-u">change domain name and add yout first alias</td></tr>'
            } else {
                for (i = 0; i < links.length; i++) {
                    if (links[i] === currentUrl.hostname) continue;
                    linkListHtml += '<tr class="domain_row">'
                        + '<td class="link" link="' + links[i] + '">' 
                        + links[i] 
                        + '</td>'
                        + '<td><i class="edit material-icons color-u" link="' + links[i] + '">create</i></td>'
                        + '<td><i class="remove material-icons color-u" link="' + links[i] + '">delete</i></td>'
                        + '</tr>'
                }
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
                        var dotPattern = new RegExp('\\.', 'g');
                        var starPattern = new RegExp('\\*', 'g');
                        var pattern = domainList[currentSetId][currentUrlId].replace(dotPattern, '\\.');
                        pattern = pattern.replace(starPattern, '[^.]+');
                        console.log(pattern);
                        pattern = new RegExp('^' + pattern + '$', '');
                        if (pattern.test(value)) {
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
                if (typeof domainList === 'undefined') {
                    domainList = [];
                }
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
                        var link = e.target.getAttribute('link').split('.');
                        var currentHost = currentUrl = new URL(tab.url).hostname.split('.');
                        console.log(link, currentHost);
                        for (var i = 0; i < link.length; i++) {
                            if (link[i] === '*') {
                                if (typeof currentHost[i] == 'undefined') {
                                    return;
                                }
                                link[i] = currentHost[i];
                            }
                        }
                        link = link.join('.');
                        currentHost = currentHost.join('.');
                        console.log(link, currentHost);
                        chrome.tabs.update(
                            tab.id, 
                            {url: tab.url.replace(currentHost, link)}
                        )
                    } else if (e.target.classList.contains('remove')) {
                        domainList[currentSetId].splice(domainList[currentSetId].indexOf(e.target.getAttribute('link')), 1);
                        saveChange(domainList);
                        drowList(domainList[currentSetId]);
                    } else if (e.target.classList.contains('edit')) {
                        var targetElement = e.target;
                        if (document.getElementById('editRowInput')) {
                            var link = targetElement.getAttribute('link');
                            drowList(domainList[currentSetId]);
                            targetElement = document.querySelector('.edit[link="' + link + '"]');
                        }
                        var edithtml = '<td><input id="editRowInput" type="text" value="' + targetElement.getAttribute('link') + '"></td>';
                        edithtml += '<td><i class="material-icons done color-u" link="' + targetElement.getAttribute('link') + '"> done </i></td>';
                        edithtml += '<td><i class="material-icons cansel color-u"> clear </i></td>';
                        targetElement.parentNode.parentNode.innerHTML = edithtml;
                    } else if (e.target.classList.contains('cansel')) {
                        drowList(domainList[currentSetId]);
                    } else if (e.target.classList.contains('done')) {
                        domainList[currentSetId][domainList[currentSetId].indexOf(e.target.getAttribute('link'))]
                            = document.getElementById('editRowInput').value;
                        saveChange(domainList);
                        drowList(domainList[currentSetId]);
                    }
                })
                //update when url change
                chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
                    currentUrl = new URL(tab.url);
                    const inputUrl = document.getElementById('aliaseInput');
                    inputUrl.value = currentUrl.hostname;
                    currentSetId = searchSetByValue(domainList, currentUrl.hostname);
                    drowList(domainList[currentSetId]);
                });
            }
        );
    })
});
