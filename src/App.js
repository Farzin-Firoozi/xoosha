/* eslint-disable no-const-assign */
/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from 'react'
import sizeMe from 'react-sizeme'

import StackGrid from 'react-stack-grid'
import Drawer from 'react-modern-drawer'
import 'react-modern-drawer/dist/index.css'
import Xicon from './x.svg'

import { fetchData } from './api'
import './App.scss'

function App(props) {
  const { size } = props
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState([])
  const listRef = useRef(null)
  let gridRef = useRef(null)

  const [query, setQuery] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)

  const [isLoading, setIsLoading] = useState(false)
  const loadingRef = useRef(isLoading)

  useEffect(() => {
    loadingRef.current = isLoading
  }, [isLoading])

  const itemTags = selectedItem?.tags?.split(',')

  const sendRequest = async (currentOffset) => {
    if (query.length > 0) {
      return
    }
    setIsLoading(true)
    await fetchData(currentOffset)
      .then((data) => {
        setData((prev) => [...prev, ...data])
      })
      .catch((err) => console.error(err?.response))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    sendRequest(offset)
  }, [offset])

  const dataToShow =
    query.length > 0
      ? data.filter((item) => {
          if (query === '') return true
          return item.description.toLowerCase().includes(query.toLowerCase())
        })
      : data

  const handleObserver = (entities) => {
    const target = entities[0]
    if (target.isIntersecting && !loadingRef.current) {
      setOffset((prev) => prev + 60)
    }
  }

  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0
    }
    const observer = new IntersectionObserver(handleObserver, options)
    if (listRef.current) {
      observer.observe(listRef.current)
    }
    return () => {
      observer.disconnect()
    }
  }, [data.length])

  useEffect(() => {
    setShowModal(!!selectedItem)
  }, [selectedItem])

  const closeHandler = () => {
    setSelectedItem(null)
  }

  return (
    <div className="App">
      <input
        className="search"
        type="text"
        onChange={(e) => setQuery(e.target.value)}
        value={query}
        placeholder="Search"
      />

      <StackGrid
        columnWidth={size.width > 700 ? 250 : '50%'}
        gutterHeight={20}
        gutterWidth={20}
        gridRef={(grid) => (gridRef.current = grid)}
      >
        {dataToShow.map((item) => {
          const itemTags = item?.tags?.split(',')
          return (
            <div key={item.id} className="item">
              <div className="image-wrapper">
                <button
                  className="overlay"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="content">Click to see details</div>
                </button>
                <img
                  loading="lazy"
                  src={item.image_url}
                  alt={item?.name}
                  width="100%"
                  className="image"
                  onLoad={() => {
                    if (gridRef.current) {
                      gridRef.current.updateLayout()
                    }
                  }}
                />
              </div>
              <div className="name">{item.name}</div>
              <div className="price">{item.price}</div>
            </div>
          )
        })}
      </StackGrid>
      {isLoading && (
        <div className="loading">
          <div></div>
        </div>
      )}

      <div ref={listRef} />

      <Drawer
        open={showModal}
        onClose={closeHandler}
        direction="bottom"
        size="80vh"
      >
        <div className="drawer">
          {selectedItem && (
            <>
              <div className="content">
                <div className="x" onClick={closeHandler}>
                  <img src={Xicon} />
                </div>
                <div className="top">
                  <section>
                    <h1>{selectedItem.name}</h1>
                    <p>{selectedItem.price}</p>
                    <div
                      className="description"
                      dangerouslySetInnerHTML={{
                        __html: selectedItem?.description
                      }}
                    />
                  </section>
                  <img
                    src={selectedItem.image_url}
                    alt={selectedItem.name}
                    className="image"
                  />
                </div>
                <div className="tags">
                  {itemTags.map((tag) => (
                    <div key={tag} className="tag">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              <div className="overlay" />
              <img
                src={selectedItem.image_url}
                alt={selectedItem.name}
                className="bg"
              />
            </>
          )}
        </div>
      </Drawer>
    </div>
  )
}

export default sizeMe()(App)
