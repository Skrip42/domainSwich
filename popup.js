document.addEventListener('DOMContentLoaded', function() {
    chrome.tabs.getSelected(null, function (tab) {
        var currentUrl = tab.url;
        const currentUrlDiv = document.getElementById('currentUrl');
        currentUrlDiv.innerHTML = tab.url;

        var domainList = [
            [
                'vipgeo.ru',
                'vipgeo1.ru',
                'vipgeo.local'
            ],
            [
                '32top.ru',
                '33top.ru',
                '32top.local'
            ],
            [
                'gdekvartira.su',
                'gdekvartira.me',
                'tutsdadut.ru'
            ]
        ]
        var linkList = [];
        var i, j;
        for (i = 0; i < domainList.length; i++) {
            for (j = 0; j < domainList[i].length; j++) {
                if (currentUrl.indexOf(domainList[i][j]) > -1) {
                    var k;
                    for (k = 0; k < domainList[i].length; k++) {
                        if (j === k) {continue;}
                        linkList.push(
                            [
                                domainList[i][k],
                                currentUrl.replace(
                                    domainList[i][j],
                                    domainList[i][k]
                                )
                            ]
                        );
                    }
                    break;
                } 
            }
        }
        var linkListHtml = "";
        for (i = 0; i < linkList.length; i++) {
            linkListHtml += '<div link="' + linkList[i][1] + '">' + linkList[i][0] + '</div>'
        }
        const domainListElement = document.getElementById('domainList');
        domainListElement.innerHTML = linkListHtml;

        domainListElement.addEventListener('click', function (e) {
            console.log(e.target);          
            console.log(e.target.getAttribute('link'));
            chrome.tabs.update(tab.id, {url: e.target.getAttribute('link')})
        })
    })
});
