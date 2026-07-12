import { describe, expect, test } from 'bun:test';

import { parseApiBaySearchJson } from '@/services/parser/apibayParser';
import { parseTorrentSearchHtml } from '@/services/parser/torrentParser';
import { ScraperError } from '@/services/scraper/scraperErrors';

const VALID_HASH = '0123456789abcdef0123456789abcdef01234567';
const SECOND_HASH = 'abcdefabcdefabcdefabcdefabcdefabcdefabcd';
const BASE32_HASH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

const validHtml = `
  <html>
    <body>
      <script>window.bad = true</script>
      <iframe src="https://tracker.example/ad"></iframe>
      <table id="searchResult">
        <tr class="ad-row"><td>Sponsored result</td></tr>
        <tr>
          <td class="vertTh">
            <a href="/browse/200">Video</a><br>
            <a href="/browse/201">Movies</a>
          </td>
          <td>
            <div class="detName">
              <a class="detLink" href="/torrent/12345/Example.Movie.2024">Example Movie 2024</a>
            </div>
            <a href="magnet:?xt=urn:btih:${VALID_HASH}&dn=Example">Magnet</a>
            <img alt="Trusted" title="VIP" />
            <font class="detDesc">Uploaded 04-01&nbsp;2024, Size 1.23 GiB, ULed by <a href="/user/alice">alice</a></font>
          </td>
          <td align="right">1,234</td>
          <td align="right">005</td>
        </tr>
      </table>
    </body>
  </html>
`;

describe('parseTorrentSearchHtml', () => {
  test('parses and normalizes valid TPB-like rows while ignoring unrelated markup', () => {
    const torrents = parseTorrentSearchHtml(validHtml);

    expect(torrents).toHaveLength(1);
    expect(torrents[0]).toEqual({
      id: 'tpb-12345',
      name: 'Example Movie 2024',
      category: 'Video',
      subcategory: 'Movies',
      uploaded: '04-01 2024',
      size: '1.23 GiB',
      seeders: 1234,
      leechers: 5,
      uploader: 'alice',
      magnet: `magnet:?xt=urn:btih:${VALID_HASH}&dn=Example`,
      detailsUrl: 'https://thepiratebay.org/torrent/12345/Example.Movie.2024',
      trusted: true,
      vip: true,
      description: 'Uploaded 04-01 2024, Size 1.23 GiB, ULed by alice',
    });
  });

  test('returns an empty list for known empty result layouts', () => {
    expect(
      parseTorrentSearchHtml(
        '<html><body><table id="searchResult"></table>No hits. Try adding an asterisk.</body></html>',
      ),
    ).toEqual([]);
  });

  test('rejects known result containers without explicit empty markup', () => {
    try {
      parseTorrentSearchHtml('<div id="searchResult"></div>');
    } catch (error) {
      expect(error).toBeInstanceOf(ScraperError);
      expect((error as ScraperError).code).toBe('layout_changed');
      return;
    }

    throw new Error('Expected layout_changed');
  });

  test('rejects known result containers with unrecognized torrent-like content', () => {
    try {
      parseTorrentSearchHtml(`
        <div id="searchResult">
          <article>
            <a href="/torrent/123/Changed.Layout">Changed Layout</a>
            <a href="magnet:?xt=urn:btih:${VALID_HASH}">Magnet</a>
          </article>
        </div>
      `);
    } catch (error) {
      expect(error).toBeInstanceOf(ScraperError);
      expect((error as ScraperError).code).toBe('layout_changed');
      return;
    }

    throw new Error('Expected layout_changed');
  });

  test('parses recoverable malformed HTML', () => {
    const torrents = parseTorrentSearchHtml(`
      <table id="searchResult">
        <tr><td><a href="/browse/100">Audio
        <td><a class="detLink" href="/torrent/55/Broken.Markup">Broken Markup
        <a href="magnet:?xt=urn:btih:${VALID_HASH}">Magnet</a>
        <font class="detDesc">Uploaded Today, Size 12 MiB, ULed by bob
        <td>10<td>2
      </table>
    `);

    expect(torrents).toHaveLength(1);
    expect(torrents[0]?.id).toBe('tpb-55');
    expect(torrents[0]?.seeders).toBe(10);
    expect(torrents[0]?.leechers).toBe(2);
  });

  test('rejects changed layouts with a typed error', () => {
    try {
      parseTorrentSearchHtml(
        '<html><body><main><article>Completely new provider card</article></main></body></html>',
      );
    } catch (error) {
      expect(error).toBeInstanceOf(ScraperError);
      expect((error as ScraperError).code).toBe('layout_changed');
      return;
    }

    throw new Error('Expected layout_changed');
  });

  test('rejects blank HTML with invalid_html', () => {
    try {
      parseTorrentSearchHtml('   ');
    } catch (error) {
      expect(error).toBeInstanceOf(ScraperError);
      expect((error as ScraperError).code).toBe('invalid_html');
      return;
    }

    throw new Error('Expected invalid_html');
  });

  test('handles invalid magnet and details URLs independently', () => {
    const torrents = parseTorrentSearchHtml(`
      <table id="searchResult">
        <tr>
          <td><a href="/browse/600">Other</a></td>
          <td>
            <a class="detLink" href="https://evil.test/torrent/1/Bad">Magnet Only</a>
            <a href="magnet:?xt=urn:btih:${SECOND_HASH}">Magnet</a>
          </td>
          <td>9</td><td>1</td>
        </tr>
        <tr>
          <td><a href="/browse/300">Applications</a></td>
          <td>
            <a class="detLink" href="/torrent/777/Details.Only">Details Only</a>
            <a href="magnet:?xt=urn:btih:not-a-hash">Bad magnet</a>
          </td>
          <td>8</td><td>0</td>
        </tr>
      </table>
    `);

    expect(torrents).toHaveLength(2);
    expect(torrents[0]?.id).toBe(`btih-${SECOND_HASH}`);
    expect(torrents[0]?.detailsUrl).toBeUndefined();
    expect(torrents[0]?.magnet).toBe(`magnet:?xt=urn:btih:${SECOND_HASH}`);
    expect(torrents[1]?.id).toBe('tpb-777');
    expect(torrents[1]?.detailsUrl).toBe(
      'https://thepiratebay.org/torrent/777/Details.Only',
    );
    expect(torrents[1]?.magnet).toBeUndefined();
  });

  test('does not remove legitimate rows or classes containing ad-like substrings', () => {
    const torrents = parseTorrentSearchHtml(`
      <table id="searchResult">
        <tr id="uploaded-row" class="uploaded badge download header">
          <td class="vertTh"><a href="/browse/101">music</a></td>
          <td>
            <a class="detLink" href="/torrent/321/Legitimate.Row">Legitimate Row</a>
            <a class="download-button" href="magnet:?xt=urn:btih:${VALID_HASH}">Download</a>
            <font class="detDesc">Uploaded Today, Size 42 MiB, ULed by carol</font>
          </td>
          <td>7</td><td>3</td>
        </tr>
      </table>
    `);

    expect(torrents).toHaveLength(1);
    expect(torrents[0]?.category).toBe('Audio');
    expect(torrents[0]?.subcategory).toBe('Music');
  });

  test('accepts base32 BTIH magnets and rejects malformed hash formats', () => {
    const torrents = parseTorrentSearchHtml(`
      <table id="searchResult">
        <tr>
          <td><a href="/browse/200">Video</a></td>
          <td>
            <a class="detLink" href="/torrent/901/Base32.Hash">Base32 Hash</a>
            <a href="magnet:?xt=urn:btih:${BASE32_HASH}">Magnet</a>
          </td>
          <td>1</td><td>0</td>
        </tr>
        <tr>
          <td><a href="/browse/200">Video</a></td>
          <td>
            <a class="detLink" href="/torrent/902/Bad.Hash">Bad Hash</a>
            <a href="magnet:?xt=urn:btih:0123456789abcdef0123456789abcdef">Magnet</a>
          </td>
          <td>2</td><td>0</td>
        </tr>
      </table>
    `);

    expect(torrents).toHaveLength(2);
    expect(torrents[0]?.magnet).toBe(`magnet:?xt=urn:btih:${BASE32_HASH}`);
    expect(torrents[1]?.magnet).toBeUndefined();
  });

  test('normalizes category labels from browse anchors when available', () => {
    const torrents = parseTorrentSearchHtml(`
      <table id="searchResult">
        <tr>
          <td><a href="/browse/201">not the canonical label</a></td>
          <td>
            <a class="detLink" href="/torrent/456/Category.Label">Category Label</a>
            <a href="magnet:?xt=urn:btih:${VALID_HASH}">Magnet</a>
          </td>
          <td>1</td><td>0</td>
        </tr>
      </table>
    `);

    expect(torrents[0]?.category).toBe('Video');
    expect(torrents[0]?.subcategory).toBe('Movies');
  });

  test('omits malformed numeric and size metadata without altering valid display strings', () => {
    const torrents = parseTorrentSearchHtml(`
      <table id="searchResult">
        <tr>
          <td><a href="/browse/601">Books</a></td>
          <td>
            <a class="detLink" href="/torrent/654/Bad.Metadata">Bad Metadata</a>
            <font class="detDesc">Uploaded Today, Size lots of bytes, ULed by dave</font>
          </td>
          <td>1.5</td><td>-2</td>
        </tr>
        <tr>
          <td><a href="/browse/601">Books</a></td>
          <td>
            <a class="detLink" href="/torrent/655/Good.Metadata">Good Metadata</a>
            <font class="detDesc">Uploaded Today, Size 1.23 GiB, ULed by erin</font>
          </td>
          <td>1,234</td><td>0</td>
        </tr>
      </table>
    `);

    expect(torrents[0]?.size).toBeUndefined();
    expect(torrents[0]?.seeders).toBeUndefined();
    expect(torrents[0]?.leechers).toBeUndefined();
    expect(torrents[1]?.size).toBe('1.23 GiB');
    expect(torrents[1]?.seeders).toBe(1234);
    expect(torrents[1]?.leechers).toBe(0);
  });
});

describe('parseApiBaySearchJson', () => {
  test('maps Apibay records to torrent models', () => {
    const torrents = parseApiBaySearchJson([
      {
        id: '123',
        name: 'Ubuntu Desktop ISO',
        info_hash: VALID_HASH,
        leechers: '5',
        seeders: '1234',
        num_files: '1',
        size: '2147483648',
        username: 'alice',
        added: '1704067200',
        status: 'vip',
        category: '303',
        imdb: '',
      },
      {
        id: '456',
        name: 'Example Movie',
        info_hash: SECOND_HASH.toUpperCase(),
        leechers: '10',
        seeders: '20',
        num_files: '2',
        size: '734003200',
        username: 'bob',
        added: '2024-02-03 04:05:06',
        status: 'trusted',
        category: '201',
        imdb: 'tt1234567',
      },
    ]);

    expect(torrents).toEqual([
      {
        id: '123',
        name: 'Ubuntu Desktop ISO',
        category: 'Applications',
        subcategory: 'UNIX',
        uploaded: '2024-01-01',
        size: '2 GiB',
        seeders: 1234,
        leechers: 5,
        uploader: 'alice',
        magnet: `magnet:?xt=urn:btih:${VALID_HASH}&dn=Ubuntu%20Desktop%20ISO`,
        detailsUrl: 'https://thepiratebay.org/description.php?id=123',
        trusted: true,
        vip: true,
      },
      {
        id: '456',
        name: 'Example Movie',
        category: 'Video',
        subcategory: 'Movies',
        uploaded: '2024-02-03',
        size: '700 MiB',
        seeders: 20,
        leechers: 10,
        uploader: 'bob',
        magnet: `magnet:?xt=urn:btih:${SECOND_HASH}&dn=Example%20Movie`,
        detailsUrl: 'https://thepiratebay.org/description.php?id=456',
        trusted: true,
        vip: false,
      },
    ]);
  });

  test('returns an empty list for Apibay empty sentinel rows', () => {
    expect(
      parseApiBaySearchJson([
        {
          id: '0',
          name: 'No results returned',
          info_hash: '',
          seeders: '0',
          leechers: '0',
          size: '0',
        },
      ]),
    ).toEqual([]);
  });

  test('skips invalid Apibay rows without over-filtering valid rows', () => {
    const torrents = parseApiBaySearchJson([
      {
        id: '1',
        name: '',
        info_hash: VALID_HASH,
        size: '1',
      },
      {
        id: '2',
        name: 'Bad Hash',
        info_hash: 'not-a-hash',
        size: '1',
      },
      {
        id: '3',
        name: 'Bad Size',
        info_hash: VALID_HASH,
        size: '-1',
      },
      {
        id: '',
        name: 'Hash Fallback',
        info_hash: VALID_HASH,
        size: '1',
      },
    ]);

    expect(torrents).toHaveLength(1);
    expect(torrents[0]?.id).toBe(`btih-${VALID_HASH}`);
    expect(torrents[0]?.size).toBe('1 B');
  });

  test('rejects non-array Apibay payloads with a typed error', () => {
    try {
      parseApiBaySearchJson({ ok: true });
    } catch (error) {
      expect(error).toBeInstanceOf(ScraperError);
      expect((error as ScraperError).code).toBe('parse_failed');
      return;
    }

    throw new Error('Expected parse_failed');
  });
});
