const https = require('https');
const cheerio = require('cheerio');
const url = 'https://www.imooc.com/learn/172';

https.get(url, (res) => {
  let html = '';

  res.on('data', (chunk) => {
    html += chunk;
  });

  res.on('end', () => {
    let courseData = getChapters(html);
    printCourse(courseData);
  })
}).on('error', (err) => {
  console.log(`error: ${err}`);
});

function printCourse(courseData) {
  courseData.forEach((course) => {
    console.log(course.chapterTitle + '\n');

    course.videos.forEach((video) => {
      console.log(`${video.id}: ${video.title}`);
    });
  });
}

function getChapters(html) {
  const $ = cheerio.load(html);
  let chapters = $('.chapter');
  let courseData = [];

  chapters.each(function(item) {
    let chapter = $(this);
    let chapterTitle = chapter.find('strong').text().trim().replace('\n', '');
    let videos = chapter.find('.video li');
    let chapterData = {
      chapterTitle: chapterTitle,
      videos : [],
    };

    videos.each(function(item) {
      let video = $(this);
      let videoTitle = video.find('.J-media-item').text().trim().replace('\n', '');
      let videoId = video.find('.J-media-item').attr('href');
      chapterData.videos.push({
        title: videoTitle,
        id: videoId,
      });
    });
    courseData.push(chapterData);
  });

  return courseData;
}
