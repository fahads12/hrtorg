import test from 'node:test';
import assert from 'node:assert/strict';
import {normalizeProduct,retainUnfetchedSources} from '../server/ingest.js';
import {sourceUrl} from '../server/network.js';
import {reloadData,searchProducts} from '../server/catalog.js';

test('an available product displays a price from an available variant',()=>{
 const p=normalizeProduct({id:1,handle:'test',title:'Example',variants:[{id:10,title:'Small',price:'10',compare_at_price:'12',available:false},{id:11,title:'Large',price:'30',compare_at_price:'35',available:true}]},'USD','2026-10-26T00:00:00Z');
 assert.equal(p.available,true);assert.equal(p.price,30);assert.equal(p.compareAtPrice,35);assert.equal(p.priceVariantId,'11');assert.equal(p.priceBasis,'lowest-available-variant');
 assert.equal(p.variants[0].price,10);assert.equal(p.variants[0].available,false);
});
test('sold-out or unpriced products do not acquire a made-up purchasable price',()=>{
 const base={id:1,handle:'test',title:'Example'};
 const sold=normalizeProduct({...base,variants:[{id:10,price:'10',available:false}]},'USD','2026-10-26T00:00:00Z');assert.equal(sold.price,10);assert.equal(sold.available,false);assert.equal(sold.priceBasis,'lowest-listed-variant');
 const missing=normalizeProduct({...base,variants:[{id:10,price:null,available:true}]},null,'2026-10-26T00:00:00Z');assert.equal(missing.price,null);assert.equal(missing.compareAtPrice,null);assert.equal(missing.currency,null);
});
test('official www HRT sources are allowed without expanding to arbitrary hosts',()=>{
 assert.equal(sourceUrl('https://www.hrt.org/contact').hostname,'www.hrt.org');
 for(const url of ['https://www.hrt.org.evil.example/','http://www.hrt.org/','https://hrt.org:444/','https://user:pass@hrt.org/'])assert.throws(()=>sourceUrl(url),/Unapproved/);
});
test('a failed or partial discovery retains old source content without renewing its verification',()=>{
 const previous=[{url:'https://hrt.org/contact',blocks:['Contact evidence'],fetchedAt:'2026-10-18T00:00:00Z'},{url:'https://hrt.org/providers',blocks:['Old provider evidence'],fetchedAt:'2026-10-18T00:00:00Z'}];
 const fresh={url:'https://hrt.org/contact',blocks:['Updated contact'],fetchedAt:'2026-10-26T00:00:00Z'};
 const result=retainUnfetchedSources(previous,[fresh],'2026-10-26T00:00:00Z');
 assert.equal(result.length,2);assert.equal(result[0],fresh);assert.equal(result[1].fetchedAt,previous[1].fetchedAt);assert.ok(result[1].lastFetchError);assert.deepEqual(result[1].blocks,previous[1].blocks);
 assert.equal(retainUnfetchedSources(previous,[],'2026-10-26T00:00:00Z').length,2);
});
await reloadData();
test('vitamin single-letter names and natural price questions retain their subject',()=>{
 const c=searchProducts({query:'vitamin C'}),d=searchProducts({query:'vitamin D'});
 assert.ok(c.products.some(p=>/vitamin c/i.test(p.name)));assert.ok(d.products.some(p=>/vitamin d/i.test(p.name)));
 assert.notDeepEqual(c.products.map(p=>p.id),d.products.map(p=>p.id));
 assert.equal(searchProducts({query:'thyroid cost'}).total,searchProducts({query:'thyroid'}).total);
 assert.equal(searchProducts({query:'vitamins C'}).total,c.total);
});
test('search does not match a token only embedded in an unrelated word',()=>{
 assert.equal(searchProducts({query:'xyroid'}).total,0);
 assert.equal(searchProducts({query:'magnes'}).total,0);
});
test('vitamin A is a nutrient name rather than a discarded article',()=>{
 const a=searchProducts({query:'vitamin A'}),d=searchProducts({query:'vitamin D'});
 assert.ok(a.products.some(p=>/vitamin a\b/i.test(p.name)));
 assert.notDeepEqual(a.products.map(p=>p.id),d.products.map(p=>p.id));
});
test('an unpriced available variant cannot borrow a sold-out variant price',()=>{
 const p=normalizeProduct({id:1,handle:'variant-check',title:'Variant check',variants:[{id:2,price:null,available:true},{id:3,price:'10',available:false}]},'USD',new Date().toISOString());
 assert.equal(p.available,true);assert.equal(p.price,null);assert.equal(p.priceVariantId,null);
});
