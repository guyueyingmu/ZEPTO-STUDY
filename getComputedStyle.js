// getComputedStyle shouldn't freak out when called
// without a valid element as argument
// function getComputedStyle(){
//     console.log('Dsdfsdf');
// }
try {
  getComputedStyle(undefined)
} catch(e) {
  var nativeGetComputedStyle = getComputedStyle;
  window.getComputedStyle = function(element){
    try {
      return nativeGetComputedStyle(element)
    } catch(e) {
      return null
    }
  }
}
