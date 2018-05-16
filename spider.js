var http = require('http'),
    fs = require('fs'),
    cheerio = require('cheerio'),
    request = require('request');
var i = 0;
var url = "http://www.ss.pku.edu.cn/index.php/research/cooperationnews/2391";

function fetchPage(x) {
    startRequest(x);
}

function startRequest(x) {
    http.get(x, function(res) {
        var html = '';
        var titles = [];
        res.setEncoding('utf-8');

        res.on('data', function(chunk) {
            html += chunk;
        })

        res.on('end', function() {
            var $ = cheerio.load(html);
            var time = $('.article-info a:first-child').next().text().trim();
            var news_item = {
                title: $('div.article-title a').text().trim(),
                Time: time,
                link: "http://www.ss.pku.edu.cn" + $("div.article-title a").attr('href'),
                author: $('div.article-info a:first-child').text().trim(),
                i: i = i + 1,
            };
            console.log(news_item);
            var news_title = $('div.article-title a').text().trim();
            savedContent($, news_title); //存储每篇文章的内容及文章标题
            savedImg($, news_title); //存储每篇文章的图片及图片标题

            var nextLink = 'http://www.ss.pku.edu.cn' + $('li.next a').attr('href'); //下一篇URL
            str1 = nextLink.split('-');
            str = encodeURI(str1[0]);
            if (i < 5) {
                fetchPage(str);
            }
        })
    }).on('error', function(err) {
        console.log(err);
    })
}

function savedContent($, news_title) { // 在本地存储所爬取的新闻内容资源
    $('.article-content p').each(function(index, item) {
        var para = $(this).text();
        var content = para.substring(0, 2).trim();
        if (content == '') {
            para = para + '\n';
            fs.appendFile('./data/' + news_title + '.txt', para, 'utf-8', function(err) {
                if (err) {
                    console.log(err);
                }
            });
        }
    })
}

function savedImg($, news_title) { //在本地存储所爬取到的图片资源
    $('.article-content img').each(function(index, item) {
        var img_title = $(this).parent().next().text().trim();
        if (img_title.length > 35 || img_title == "") {
            img_title = "Null";
        }
        var img_filename = img_title + '.jpg';
        var img_src = 'http://www.ss.pku.edu.cn' + $(this).attr('src');

        request.head(img_src, function(err, res, body) {
            if (err) {
                console.log(err);
            }
        });
        request(img_src).pipe(fs.createWriteStream('./image/' + news_title + '---' + img_filename));
    })
}

fetchPage(url);