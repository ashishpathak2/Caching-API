var express = require('express');
var router = express.Router();

const MAX_CACHE_SIZE = 10;
const cache = new Map();

function setCache(key, value) {
    if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
    }
    cache.set(key, value);
}

function getCache(key) {
    if (!cache.has(key)) return null;
    const value = cache.get(key);
    cache.delete(key);
    cache.set(key, value); // Move to end (recently used)
    return value;
}

function deleteCache(key) {
    return cache.delete(key);
}

router.post('/cache', (req, res) => {
    const { key, value } = req.body;
    if (!key || !value) return res.status(400).json({ error: 'Key and value required' });
    if (cache.size >= MAX_CACHE_SIZE && !cache.has(key)) {
        return res.status(400).json({ error: 'Cache limit reached' });
    }
    setCache(key, value);
    res.json({ message: 'Stored successfully', key, value});
});

router.get('/cache/:key', (req, res) => {
    const value = getCache(req.params.key);
    if (value === null) return res.status(404).json({ error: 'Key not found' });
    res.json({ key: req.params.key, value });
});

router.delete('/cache/:key', (req, res) => {
    if (!cache.has(req.params.key)) return res.status(404).json({ error: 'Key not found' });
    deleteCache(req.params.key);
    res.json({ message: 'Deleted successfully', key: req.params.key });
});


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

module.exports = router;
