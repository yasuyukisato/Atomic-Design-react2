const express = require('express');
const { google } = require('googleapis');
// const { YOUTUBE_API_KEY } = require('../api_key');

/* 先ほど取得したAPIキーを設定する */
const YOUTUBE_API_KEY = 'AIzaSyC7UnGBvUwvK2vykPSahMYOjuDLcO7r7Js';

const youtube = google.youtube({
  version: 'v3',
  auth: YOUTUBE_API_KEY,
});

const router = express.Router();

router.get('/videos/search/:keyword', (req, res, next) => {
  const { keyword } = req.params;
  const { pageToken } = req.query;
  (async () => {
    // 検索結果を動画IDで取得
    const { data: { items: idItems, nextPageToken } } = await youtube.search.list({
      part: 'id',
      q: keyword,
      type: 'video',
      maxResults: 20,
      pageToken,
    });
    // 動画の情報を取得
    const ids = idItems.map(({ id: { videoId } }) => videoId);
    const { data: { items } } = await youtube.videos.list({
      part: 'statistics,snippet',
      id: ids.join(','),
    });
    res.json({ items, nextPageToken });
  })().catch(next);
});

// 以下追加する
// 動画詳細情報取得
router.get('/videos/:videoId', (req, res, next) => {
  const { videoId } = req.params;
  (async () => {
    // 動画の情報を取得
    const { data: { items } } = await youtube.videos.list({
      part: 'statistics,snippet',
      id: videoId,
    });
    res.json(items[0]);
  })().catch(next);
});

// 関連動画取得
router.get('/videos/:videoId/related', (req, res, next) => {
  const { videoId: relatedToVideoId } = req.params;
  const { pageToken } = req.query;
  (async () => {
    // 関連動画のIDを取得
    const { data: { items: idItems, nextPageToken } } = await youtube.search.list({
      part: 'id',
      relatedToVideoId,
      type: 'video',
      maxResults: 20,
      pageToken,
    });
    // 動画の情報を取得
    const ids = idItems.map(({ id: { videoId } }) => videoId);
    const { data: { items } } = await youtube.videos.list({
      part: 'statistics,snippet',
      id: ids.join(','),
    });
    res.json({ items, nextPageToken });
  })().catch(next);
});

module.exports = router;