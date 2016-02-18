//= require ../lib/_lunr

(function () {
  'use strict';

  var originalSearchResults, originalDropdownLinks;
  var searchResults, dropdownLinks;

  var index = new lunr.Index();

  index.ref('id');
  index.field('title', { boost: 10 });
  index.field('body');
  index.pipeline.add(lunr.trimmer, lunr.stopWordFilter);

  $(captureOriginal);
  $(bindDropdownPointers);
  $(populateFilter);
  $(bindFilter);

  function captureOriginal() {
    originalSearchResults = $('.dropdown-content .dropdown-list').clone();
    originalDropdownLinks = originalSearchResults.find('.version-link').clone();
  }

  function bindDropdownPointers() {
    dropdownLinks = $('.dropdown-content .version-link');
  }

  function restoreOriginalContent() {
    searchResults.html(originalSearchResults.html());
  }

  function bindFilter() {
    searchResults = $('.dropdown-content .dropdown-list');
    $('#version-select').on('keyup', filterDropdown);
  }

  function populateFilter() {
    dropdownLinks.each(function() {
      var link = $(this);

      index.add({
        id: link.prop('id'),
        title: link.text(),
        href: link.href
      });
    });
  }

  function findMatchingLinkFromOriginal(id) {
    var match = originalDropdownLinks.filter("#" + id)[0];
    return match;
  }

  function displaySearchResults(results) {
    $.each(results, function (index, result) {
      var matchingLink = findMatchingLinkFromOriginal(result.ref);
      searchResults.append(matchingLink);
    });
  }

  function filterDropdown(event) {
    // ESC clears the field
    if (event.keyCode === 27) this.value = '';

    if (this.value) {
      var results = index.search(this.value).filter(function(r) {
        return r.score > 0.0001;
      });
      if (results.length) {
        searchResults.empty();
        displaySearchResults(results);
      } else {
        searchResults.html('<li>' + 'No Results Found for "' + this.value + '"' + '</li>');
      }
    } else {
      searchResults.empty();
      restoreOriginalContent();
      searchResults = $('.dropdown-content .dropdown-list');
      populateFilter();
    }
  }

})();