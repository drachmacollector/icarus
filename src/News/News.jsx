// src/pages/News.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import "./news.css";

const SPACE_NEWS_API = "https://api.spaceflightnewsapi.net/v4/articles/?limit=50";
const NASA_RSS = "https://api.rss2json.com/v1/api.json?rss_url=https://www.nasa.gov/rss/dyn/breaking_news.rss";
const ESA_RSS = "https://api.rss2json.com/v1/api.json?rss_url=https://www.esa.int/rssfeed/Our_Activities";

const News = () => {
  const [articles, setArticles] = useState([]);
  const [nasaNews, setNasaNews] = useState([]);
  const [esaNews, setEsaNews] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const articlesPerPage = 6;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllNews = async () => {
      try {
        const [spaceRes, nasaRes, esaRes] = await Promise.all([
          axios.get(SPACE_NEWS_API),
          axios.get(NASA_RSS),
          axios.get(ESA_RSS),
        ]);

        setArticles(spaceRes.data.results);
        setNasaNews(nasaRes.data.items);
        setEsaNews(esaRes.data.items);
      } catch (err) {
        console.error("Error fetching news:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllNews();
  }, []);

  const filteredArticles = articles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * articlesPerPage;
  const indexOfFirst = indexOfLast - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  return (
    <div className="news-container">
      <h1>🪐 Latest Space News</h1>

      <input
        type="text"
        placeholder="Search space news..."
        className="search-input"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {loading ? (
        <p>Loading news...</p>
      ) : (
        <>
          <div className="news-grid">
            {currentArticles.map((article) => (
              <div key={article.id} className="news-card">
                <img
                  src={article.imageUrl || "https://via.placeholder.com/400x200?text=No+Image"}
                  alt={article.title}
                />
                <h2>{article.title}</h2>
                <p>{article.summary}</p>
                <p><strong>Published:</strong> {new Date(article.publishedAt).toLocaleDateString()}</p>
                <a href={article.url} target="_blank" rel="noopener noreferrer">
                  🔗 Read Full Article
                </a>
              </div>
            ))}
          </div>

          <div className="pagination">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={currentPage === i + 1 ? "active" : ""}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <div className="rss-section">
            <h2>🛰 NASA Headlines</h2>
            <ul>
              {nasaNews.slice(0, 5).map((item, i) => (
                <li key={i}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                </li>
              ))}
            </ul>

            <h2>🌌 ESA Headlines</h2>
            <ul>
              {esaNews.slice(0, 5).map((item, i) => (
                <li key={i}>
                  <a href={item.link} target="_blank" rel="noopener noreferrer">{item.title}</a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default News;
