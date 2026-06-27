//   Prevent theme flash: apply dark class before paint if saved 
    (function() {
      if (localStorage.getItem('shopwave-theme') === 'dark') {
        document.documentElement.classList.add('dark');
        document.addEventListener('DOMContentLoaded', function() {
          document.body.classList.add('dark');
        });
      }
    })();
