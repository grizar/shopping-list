function _getBaseUrl(category) {
    return category === 'Food' ? 'https://world.openfoodfacts.org' : 'https://world.openbeautyfacts.org';
}

async function getProduct(ean, category) {
  const url = _getBaseUrl(category) + '/api/v0/product/' + ean + '.json';
  console.log(url);
  try {
      const response = await fetch(url, {
          method: 'GET',
          headers: {
              Accept: 'application/json',
              'Content-Type': 'text/plain'
              // ,UserAgent: navigator.userAgent
          }
      });
      const product = await response.json();
      console.log(product);
      if (product.status === 0) {
          return null;
      }
      return product;
  } catch (error) {
      console.error(error);
      return null;
  }
}  


export async function getOpenFacts(ean) {
  var produit = await getProduct(ean,'Food');
  if (produit != null) {
    return produit.product.product_name;
  } else {
    produit = await getProduct(ean,'Beauty');
    if (produit != null) {
      return produit.product.product_name;
    } else {
      return null;
    }
  }
}
