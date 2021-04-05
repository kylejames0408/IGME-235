/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function mobileDropdown() {
    document.getElementById("mobileDropdownContent").classList.toggle("show");
}
  
  // Close the dropdown if the user clicks outside of it
  window.onclick = function(e) {
    if (!e.target.matches('.mobileDropdownButton')) {
        var myDropdown = document.getElementById("mobileDropdownContent");
        if (myDropdown.classList.contains('show')) {
                myDropdown.classList.remove('show');
        }
    }
}