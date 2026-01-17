import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import styles from '../styles/SearchBar.module.css'

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [category, setCategory] = useState('all')
  const navigate = useNavigate()

  const categories = [
    { value: 'all', label: 'All Departments' },
    { value: 'electronics', label: 'Electronics' },
    { value: 'computers', label: 'Computers' },
    { value: 'home', label: 'Home & Kitchen' },
    { value: 'fashion', label: 'Fashion' },
    { value: 'beauty', label: 'Beauty & Personal Care' },
    { value: 'sports', label: 'Sports & Outdoors' },
    { value: 'books', label: 'Books' }
  ]

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}&category=${category}`)
    }
  }

  return (
    <form className={styles.searchBar} onSubmit={handleSearch}>
      <div className={styles.searchWrapper}>
        <div className={styles.categorySelect}>
          <select 
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={styles.select}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        
        <div className={styles.searchInput}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Amazon.eg"
            className={styles.input}
          />
        </div>
        
        <button type="submit" className={styles.searchButton}>
          <FontAwesomeIcon icon={faSearch} />
        </button>
      </div>
    </form>
  )
}

export default SearchBar;