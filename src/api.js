export const fetchData = (offset) => {
  return new Promise((resolve, reject) => {
    fetch(`http://xoosha.com/ws/1/test.php?offset=${offset}`)
      .then((response) => response.json())
      .then((data) => {
        resolve(data)
      })
      .catch((error) => {
        reject(error)
      })
  })
}
