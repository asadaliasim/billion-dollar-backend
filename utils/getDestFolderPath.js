const typeToPath = {
  display: 'profile/display',
  cover: 'profile/cover',
  block: 'blocks'
}

/**
 *
 * @param {string} type is file location e.g display
 * @param {string} prefix is optional. it will be prepended to the path
 * @returns
 */
module.exports = function (type, prefix = '') {
  const path = typeToPath[type]
  if (path) return `${prefix}/public/${path}`
  return `${prefix}/public/unknown`
}
