(() => {
  const $ = (s, root=document) => root.querySelector(s);
  const $$ = (s, root=document) => [...root.querySelectorAll(s)];

  const grid = $('#productGrid');
  const cards = $$('.product-card', grid);
  const count = $('#resultCount');
  let activeFilter = 'all';
  let sortAsc = true;
  let qty = 1;
  let currentImage = '';

  const detail = $('#product-modal');
  const detailImage = $('#modal-product-image');
  const detailButton = $('#modal-image-button');
  const detailName = $('#modal-product-name');
  const detailPrice = $('#modal-product-price');
  const detailCategory = $('#modal-category');
  const detailDescription = $('#modal-description');
  const colourOptions = $('#colour-options');
  const selectedColour = $('#selected-colour');
  const selectedSize = $('#selected-size');

  const lightbox = $('#image-lightbox');
  const lightboxImage = $('#lightbox-image');

  function money(value){ return '₹' + Number(value || 0).toLocaleString('en-IN'); }

  function projectName(category=''){
    const c = category.split(/\s+/).find(x => x.startsWith('project-')) || category;
    return c.replace('project-','').replace(/-/g,' ').toUpperCase();
  }

  function applyFilter(filter='all'){
    activeFilter = filter;
    let visible = cards.filter(card => {
      const cats = (card.dataset.category || '').split(/\s+/);
      const show = filter === 'all' || cats.includes(filter);
      card.hidden = !show;
      return show;
    });
    count.textContent = String(visible.length).padStart(2,'0') + ' PIECES';
    $$('.chip').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    $$('.menu-links button').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
    const empty = $('#emptyState');
    if (empty) empty.classList.toggle('show', visible.length === 0);
  }

  function openDetails(card){
    if(!card) return;
    const img = $('.product-image img', card);
    if(!img) return;
    currentImage = img.currentSrc || img.src;
    detailImage.src = currentImage;
    detailImage.alt = img.alt || card.dataset.name || 'Product image';
    detailName.textContent = card.dataset.name || 'Product';
    detailPrice.textContent = money(card.dataset.price);
    detailCategory.textContent = 'PROJECT ' + projectName(card.dataset.category);
    detailDescription.textContent = card.dataset.description || 'Premium statement piece from the collection.';

    const colours = (card.dataset.colors || 'Black|White|Midnight Blue').split('|').filter(Boolean);
    colourOptions.innerHTML = colours.map((c,i) => `<button type="button" data-colour="${c.replace(/"/g,'&quot;')}" class="${i===0?'active':''}">${c}</button>`).join('');
    selectedColour.textContent = colours[0] || 'Black';
    $$('#size-options button').forEach((b,i) => b.classList.toggle('active', i===1));
    selectedSize.textContent = 'M';
    qty = 1;
    $('#qty-value').textContent = '1';

    detail.classList.add('is-open');
    detail.setAttribute('aria-hidden','false');
    document.body.classList.add('modal-open');
  }

  function closeDetails(){
    detail.classList.remove('is-open');
    detail.setAttribute('aria-hidden','true');
    document.body.classList.remove('modal-open');
  }

  function openZoom(){
    if(!currentImage) return;
    lightboxImage.src = currentImage;
    lightboxImage.alt = detailImage.alt || 'Product image';
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden','false');
    document.body.classList.add('zoom-open');
  }

  function closeZoom(){
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden','true');
    lightboxImage.removeAttribute('src');
    document.body.classList.remove('zoom-open');
  }

  // Every product in every collection opens the same professional detail view.
  grid.addEventListener('click', e => {
    if(e.target.closest('.heart')) return;
    const card = e.target.closest('.product-card');
    if(card) openDetails(card);
  });

  // Clicking the product image INSIDE the detail view opens the full image zoom.
  detailButton.addEventListener('click', e => { e.preventDefault(); openZoom(); });
  $('#product-modal-close').addEventListener('click', closeDetails);
  $('#lightbox-image').addEventListener('click', closeZoom);
  $('.lightbox-close').addEventListener('click', closeZoom);
  lightbox.addEventListener('click', e => { if(e.target === lightbox || e.target === $('.lightbox-stage')) closeZoom(); });
  detail.addEventListener('click', e => { if(e.target === detail) closeDetails(); });

  colourOptions.addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    $$('#colour-options button').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); selectedColour.textContent = b.dataset.colour;
  });
  $('#size-options').addEventListener('click', e => {
    const b = e.target.closest('button'); if(!b) return;
    $$('#size-options button').forEach(x => x.classList.remove('active'));
    b.classList.add('active'); selectedSize.textContent = b.dataset.size;
  });
  $('#qty-minus').addEventListener('click', () => { qty=Math.max(1,qty-1); $('#qty-value').textContent=qty; });
  $('#qty-plus').addEventListener('click', () => { qty++; $('#qty-value').textContent=qty; });

  // Collection navigation works on desktop, mobile menu and chips.
  document.addEventListener('click', e => {
    const filterButton = e.target.closest('[data-filter]');
    if(filterButton && !filterButton.classList.contains('product-card')){
      const filter = filterButton.dataset.filter;
      if(filter){ applyFilter(filter); $('#shop')?.scrollIntoView({behavior:'smooth',block:'start'}); }
    }
  });

  // Mobile side menu.
  const sideMenu = $('#sideMenu'), menuOverlay = $('#menuOverlay');
  function closeMenu(){ sideMenu?.classList.remove('open'); menuOverlay?.classList.remove('open'); }
  $('#menuBtn')?.addEventListener('click', ()=>{ sideMenu.classList.add('open'); menuOverlay.classList.add('open'); });
  $('#closeMenu')?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', closeMenu);
  $$('.menu-links button').forEach(b => b.addEventListener('click', closeMenu));

  $('#sortBtn')?.addEventListener('click', () => {
    const visible = cards.filter(c => !c.hidden);
    visible.sort((a,b) => (Number(a.dataset.price)-Number(b.dataset.price))*(sortAsc?1:-1));
    visible.forEach(c => grid.appendChild(c));
    sortAsc = !sortAsc;
  });

  document.addEventListener('keydown', e => {
    if(e.key !== 'Escape') return;
    if(lightbox.classList.contains('is-open')) closeZoom();
    else if(detail.classList.contains('is-open')) closeDetails();
    else closeMenu();
  });

  applyFilter('all');
})();
