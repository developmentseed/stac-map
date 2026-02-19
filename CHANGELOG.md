# Changelog

## [1.3.2](https://github.com/developmentseed/stac-map/compare/v1.3.1...v1.3.2) (2026-02-19)


### Bug Fixes

* more clickable and visible lines ([#332](https://github.com/developmentseed/stac-map/issues/332)) ([d4bd83c](https://github.com/developmentseed/stac-map/commit/d4bd83c5379cf227be583a33b274660750860768))

## [1.3.1](https://github.com/developmentseed/stac-map/compare/v1.3.0...v1.3.1) (2026-02-19)


### Bug Fixes

* update stac-wasm ([#329](https://github.com/developmentseed/stac-map/issues/329)) ([b1bb33d](https://github.com/developmentseed/stac-map/commit/b1bb33d9d64f4ea04004e78fe487d974f47fa300))

## [1.3.0](https://github.com/developmentseed/stac-map/compare/v1.2.0...v1.3.0) (2026-02-19)


### Features

* add linestring support ([#325](https://github.com/developmentseed/stac-map/issues/325)) ([bd1792d](https://github.com/developmentseed/stac-map/commit/bd1792d6a12850faf324c76e673790d4dfa51af2))


### Bug Fixes

* don't make previews for forks ([#327](https://github.com/developmentseed/stac-map/issues/327)) ([b56d739](https://github.com/developmentseed/stac-map/commit/b56d739c387067340e29c1958c2fffdb77bc85d0)), closes [#326](https://github.com/developmentseed/stac-map/issues/326)

## [1.2.0](https://github.com/developmentseed/stac-map/compare/v1.1.0...v1.2.0) (2026-02-06)


### Features

* wmts ([#316](https://github.com/developmentseed/stac-map/issues/316)) ([f49677d](https://github.com/developmentseed/stac-map/commit/f49677d3177cb8b051f8a6fbd8c1f655a7f62285))

## [1.1.0](https://github.com/developmentseed/stac-map/compare/v1.0.4...v1.1.0) (2026-02-05)


### Features

* web-map-links for TileJSON ([#311](https://github.com/developmentseed/stac-map/issues/311)) ([045c884](https://github.com/developmentseed/stac-map/commit/045c884d22ee2dd986be9e7b1447fed5bd342ce1))

## [1.0.4](https://github.com/developmentseed/stac-map/compare/v1.0.3...v1.0.4) (2026-02-05)


### Bug Fixes

* add collection extents to card footer ([cf55d62](https://github.com/developmentseed/stac-map/commit/cf55d62729ba0a549a8ce0a705691ee2079c399e))
* filling collections ([#309](https://github.com/developmentseed/stac-map/issues/309)) ([cf55d62](https://github.com/developmentseed/stac-map/commit/cf55d62729ba0a549a8ce0a705691ee2079c399e))

## [1.0.3](https://github.com/developmentseed/stac-map/compare/v1.0.2...v1.0.3) (2026-02-05)


### Bug Fixes

* always try to show visual assets ([#304](https://github.com/developmentseed/stac-map/issues/304)) ([af484af](https://github.com/developmentseed/stac-map/commit/af484affc767d34889843de307d01a8fe77883ee)), closes [#301](https://github.com/developmentseed/stac-map/issues/301)
* attach upload button to input ([5be42fd](https://github.com/developmentseed/stac-map/commit/5be42fd62b6b73a723fb89dcbfc71ac0f19e3bfb))
* don't break when there's no collections in a catalog ([5be42fd](https://github.com/developmentseed/stac-map/commit/5be42fd62b6b73a723fb89dcbfc71ac0f19e3bfb))
* don't get SAS for public Planetary Computer assets ([5be42fd](https://github.com/developmentseed/stac-map/commit/5be42fd62b6b73a723fb89dcbfc71ac0f19e3bfb))
* save per-collection searches ([#302](https://github.com/developmentseed/stac-map/issues/302)) ([5be42fd](https://github.com/developmentseed/stac-map/commit/5be42fd62b6b73a723fb89dcbfc71ac0f19e3bfb))
* sign Planetary Computer thumbnails ([5be42fd](https://github.com/developmentseed/stac-map/commit/5be42fd62b6b73a723fb89dcbfc71ac0f19e3bfb))

## [1.0.2](https://github.com/developmentseed/stac-map/compare/v1.0.1...v1.0.2) (2026-02-04)


### Bug Fixes

* add a hive partitioned setting ([#295](https://github.com/developmentseed/stac-map/issues/295)) ([4f3957b](https://github.com/developmentseed/stac-map/commit/4f3957b3ce444eb075d64622be8032bcefc365d2))
* expand the assets that can be considered thumbnails ([#298](https://github.com/developmentseed/stac-map/issues/298)) ([0d1e1d2](https://github.com/developmentseed/stac-map/commit/0d1e1d286a065602b3fadeae366da5c39d9dd609))
* use prev or previous for previous link ([#300](https://github.com/developmentseed/stac-map/issues/300)) ([1cdd741](https://github.com/developmentseed/stac-map/commit/1cdd7411eb39d882787f5ead8ca63c20fe4bba58))

## [1.0.1](https://github.com/developmentseed/stac-map/compare/v1.0.0...v1.0.1) (2026-02-02)


### Bug Fixes

* move collection pagination above collections ([#289](https://github.com/developmentseed/stac-map/issues/289)) ([b1a8b16](https://github.com/developmentseed/stac-map/commit/b1a8b16ac3375f09b873c60b15f279c17b6c4507))
* restrict to three-band cogs by default ([#291](https://github.com/developmentseed/stac-map/issues/291)) ([e785e4d](https://github.com/developmentseed/stac-map/commit/e785e4d76adb612a2e580f387d1a6e964c417a0f)), closes [#285](https://github.com/developmentseed/stac-map/issues/285)
* use filtered collections for collection bounds ([#287](https://github.com/developmentseed/stac-map/issues/287)) ([5ed4ab7](https://github.com/developmentseed/stac-map/commit/5ed4ab70448d598d0670090b8c1b997ddf982471))

## [1.0.0](https://github.com/developmentseed/stac-map/compare/v0.14.0...v1.0.0) (2026-02-02)


### ⚠ BREAKING CHANGES

* use zustand for state management

### Features

* add action bar for pagination ([5fb56c1](https://github.com/developmentseed/stac-map/commit/5fb56c1142932782e8e86562fb78d8097276c07c))
* add globe view ([#282](https://github.com/developmentseed/stac-map/issues/282)) ([fbb9c49](https://github.com/developmentseed/stac-map/commit/fbb9c4905646977f09e2e046d602b26240eb0360)), closes [#145](https://github.com/developmentseed/stac-map/issues/145)
* add limit to search ([#276](https://github.com/developmentseed/stac-map/issues/276)) ([a3c84dd](https://github.com/developmentseed/stac-map/commit/a3c84ddf27f4f09aa8280a9ef8e9a57f9079777d))
* allow picking collections ([5fb56c1](https://github.com/developmentseed/stac-map/commit/5fb56c1142932782e8e86562fb78d8097276c07c))
* better visual feedback when loading ([5fb56c1](https://github.com/developmentseed/stac-map/commit/5fb56c1142932782e8e86562fb78d8097276c07c))
* focus on hovered collections ([5fb56c1](https://github.com/developmentseed/stac-map/commit/5fb56c1142932782e8e86562fb78d8097276c07c))
* next and prev for feature collections ([#283](https://github.com/developmentseed/stac-map/issues/283)) ([3b8a970](https://github.com/developmentseed/stac-map/commit/3b8a97065d99c2b15da1eb4e2e061293559b010d))
* show and hide collections and items (when both are present) ([#273](https://github.com/developmentseed/stac-map/issues/273)) ([187bf06](https://github.com/developmentseed/stac-map/commit/187bf064abd347eae2c117532ecb95f88f1a29b1))
* sign Planetary Computer assets ([5fb56c1](https://github.com/developmentseed/stac-map/commit/5fb56c1142932782e8e86562fb78d8097276c07c))
* sign planetary computer assets for download ([#281](https://github.com/developmentseed/stac-map/issues/281)) ([c760c69](https://github.com/developmentseed/stac-map/commit/c760c69bda04886d2cccd0b2f6d4578919f05d9d))
* visualize four-band geoTIFFs ([5fb56c1](https://github.com/developmentseed/stac-map/commit/5fb56c1142932782e8e86562fb78d8097276c07c))


### Bug Fixes

* better map error boundary ([#271](https://github.com/developmentseed/stac-map/issues/271)) ([577e479](https://github.com/developmentseed/stac-map/commit/577e479d1e302736af22e6b1a05d4a64d081f600)), closes [#267](https://github.com/developmentseed/stac-map/issues/267)
* don't fill picked item ([#279](https://github.com/developmentseed/stac-map/issues/279)) ([045673e](https://github.com/developmentseed/stac-map/commit/045673e3aa50b53c891b793e1ca0499d396b0b8d))
* replace state ([#278](https://github.com/developmentseed/stac-map/issues/278)) ([ea2bc5f](https://github.com/developmentseed/stac-map/commit/ea2bc5f641be2947042bffdb730af3e0ad3bdba7))
* time slider for stac geoparquet ([5fb56c1](https://github.com/developmentseed/stac-map/commit/5fb56c1142932782e8e86562fb78d8097276c07c))
* truncate asset titles ([#277](https://github.com/developmentseed/stac-map/issues/277)) ([cb3004c](https://github.com/developmentseed/stac-map/commit/cb3004ce4bf1ffa0aa200f387da886862fdb8dec))


### Code Refactoring

* use zustand for state management ([5fb56c1](https://github.com/developmentseed/stac-map/commit/5fb56c1142932782e8e86562fb78d8097276c07c))

## [0.14.0](https://github.com/developmentseed/stac-map/compare/stac-map-v0.13.1...stac-map-v0.14.0) (2026-01-23)


### Features

* abort searching ([3600b19](https://github.com/developmentseed/stac-map/commit/3600b19745ca27341923f054e7f3cdad0c8f2afb))
* add @developmentseed/deck.gl-geotiff ([#244](https://github.com/developmentseed/stac-map/issues/244)) ([5baf928](https://github.com/developmentseed/stac-map/commit/5baf9282f96624d907e2d11a2606bf3caa76db2a))
* add about dialog ([adeff39](https://github.com/developmentseed/stac-map/commit/adeff390eb75e572d7fdfa21fd398575f74d5993))
* add color mode ([d55ccd6](https://github.com/developmentseed/stac-map/commit/d55ccd6275236004a6f77cd7aae271081f99abce))
* add download button ([024e7dd](https://github.com/developmentseed/stac-map/commit/024e7dd7a8f24382c632701cbc7a9b2f4a9ccd42))
* add error boundary for map ([#109](https://github.com/developmentseed/stac-map/issues/109)) ([5bb07d5](https://github.com/developmentseed/stac-map/commit/5bb07d57d91a96752aafe747e47120d0ed7fac7b))
* add favicon ([#63](https://github.com/developmentseed/stac-map/issues/63)) ([8cb910d](https://github.com/developmentseed/stac-map/commit/8cb910d19ca5762797fd2135af121bad826d8318))
* add file upload ([53f7aa3](https://github.com/developmentseed/stac-map/commit/53f7aa3bf4387d8c80843813f92dde0f75383a5e))
* add fill color ([65a39bb](https://github.com/developmentseed/stac-map/commit/65a39bb062e4d683988abeaa147dc98a94687e77))
* add HOT OAM to the list of examples ([#208](https://github.com/developmentseed/stac-map/issues/208)) ([5c2597a](https://github.com/developmentseed/stac-map/commit/5c2597ac02e34ddefbae9c314ff5c7bf09e43c87))
* add items to panel ([30df364](https://github.com/developmentseed/stac-map/commit/30df3648857a2fe94a639e9761668cfebd359eac))
* add light ci ([#7](https://github.com/developmentseed/stac-map/issues/7)) ([f06c548](https://github.com/developmentseed/stac-map/commit/f06c5487991ccbbabdec0b19978d91c42045825c))
* add more feature collection stuff ([27ee95f](https://github.com/developmentseed/stac-map/commit/27ee95f19ccc66471e44839b152134a403b86a7a))
* add more text to the about section ([9154ebc](https://github.com/developmentseed/stac-map/commit/9154ebcfdcd10b0c9d17e2bd1dc9f8b3c44d7624))
* add note about stac-geoparquet upload and download ([d32ad25](https://github.com/developmentseed/stac-map/commit/d32ad252a6239a2424d88a5f63bf3f68a28b5c6b))
* add search ([6da29a0](https://github.com/developmentseed/stac-map/commit/6da29a0a63155acb56ed836996e9d08e9a9b6de2))
* add semantic-release ([#110](https://github.com/developmentseed/stac-map/issues/110)) ([cc192b3](https://github.com/developmentseed/stac-map/commit/cc192b3ff8d90de2a39bef0ac1235fda4c9d5dd3))
* add simple vitest ([#68](https://github.com/developmentseed/stac-map/issues/68)) ([3f65d52](https://github.com/developmentseed/stac-map/commit/3f65d52f060d45f600a301294cbaa4777d78c8ec))
* add skeleton ([0e3514a](https://github.com/developmentseed/stac-map/commit/0e3514aae39a24ad96e8ffa6bb65bf440a92b8a4))
* add some assets ([2f7136d](https://github.com/developmentseed/stac-map/commit/2f7136d5257ad65e15b01136f907b73cd83fa7c6))
* add spinner when loading ([#106](https://github.com/developmentseed/stac-map/issues/106)) ([920eff9](https://github.com/developmentseed/stac-map/commit/920eff9c0212da672f97f75830fd57800473aebc))
* add stac-geoparquet schema ([#75](https://github.com/developmentseed/stac-map/issues/75)) ([09094c3](https://github.com/developmentseed/stac-map/commit/09094c3a944ec7bc24828e2452e740db43158085))
* add start and end datetime ([549febc](https://github.com/developmentseed/stac-map/commit/549febc0d5dd531d1de1dd805815322064a4e4f4))
* Add support for geoarrow point layers ([#241](https://github.com/developmentseed/stac-map/issues/241)) ([3c1f02e](https://github.com/developmentseed/stac-map/commit/3c1f02e882b186f37af74c06f00f0e450a64e137))
* add TiTiler link for items ([6e52fc5](https://github.com/developmentseed/stac-map/commit/6e52fc599556ff6eb251417dc347782fa3b2fd2d))
* add titiler link for items ([#40](https://github.com/developmentseed/stac-map/issues/40)) ([bc3c8cc](https://github.com/developmentseed/stac-map/commit/bc3c8cc72d0cec25fb3ba6e6c3bb3be2823406d0))
* add upload ([3b792a2](https://github.com/developmentseed/stac-map/commit/3b792a256e5e71f1d9e5b0e8c35093d71c7af651))
* added kyfromabove api to the examples ([#178](https://github.com/developmentseed/stac-map/issues/178)) ([6c13f2f](https://github.com/developmentseed/stac-map/commit/6c13f2f603ffffa4278ae7da2b661c2269ebc826))
* asset cards and breadcrumb refactor ([#67](https://github.com/developmentseed/stac-map/issues/67)) ([9daf05d](https://github.com/developmentseed/stac-map/commit/9daf05d682c40e147ea30cbaf2da3745b60b84ef))
* back to provider ([c016d4a](https://github.com/developmentseed/stac-map/commit/c016d4a39720eb4913eb36ee090b1b9f8d623781))
* bbox ([7212264](https://github.com/developmentseed/stac-map/commit/7212264ebeda339b6209d31fd78315f2af615071))
* better asset display ([654dd1d](https://github.com/developmentseed/stac-map/commit/654dd1df43e9d470b963ed9da45b8b6b452892d9))
* better dispatch ([bf2b462](https://github.com/developmentseed/stac-map/commit/bf2b462a108a0d9cf9be88091e706243de050372))
* better indicators ([16d748c](https://github.com/developmentseed/stac-map/commit/16d748c46ccaea1b2ab4e466b42fae2c10344711))
* clear search ([#8](https://github.com/developmentseed/stac-map/issues/8)) ([60fca8e](https://github.com/developmentseed/stac-map/commit/60fca8e3b0fd2e73a2562fa1363c7836e691e01a))
* collapsable sections ([#105](https://github.com/developmentseed/stac-map/issues/105)) ([5f782fa](https://github.com/developmentseed/stac-map/commit/5f782faf50cf6b44589173a61fae6509191d69d8))
* collection pagination ([#161](https://github.com/developmentseed/stac-map/issues/161)) ([7ace8c7](https://github.com/developmentseed/stac-map/commit/7ace8c7bd1e95bff21222dd5ea5f585eb7822ad1))
* configurable autoLoad on search ([#122](https://github.com/developmentseed/stac-map/issues/122)) ([db2e289](https://github.com/developmentseed/stac-map/commit/db2e28949411655450d3c790c5581caa330a34e9))
* control input ([df692dd](https://github.com/developmentseed/stac-map/commit/df692dd9af20458971c68ee8aeee8579e473fdeb))
* convert relative paths to absolute ([#108](https://github.com/developmentseed/stac-map/issues/108)) ([2b7a9ef](https://github.com/developmentseed/stac-map/commit/2b7a9ef189e646672e10aed44a567944210e6ad1))
* deselect all collections ([382599e](https://github.com/developmentseed/stac-map/commit/382599e7d460d53515816fe3006e5ba5ff006962))
* download, including stac-geoparquet ([#74](https://github.com/developmentseed/stac-map/issues/74)) ([ec6d973](https://github.com/developmentseed/stac-map/commit/ec6d973255ba80ceac1ccc9b6f8eb6a959082ca2))
* filter by time ([cbd7af2](https://github.com/developmentseed/stac-map/commit/cbd7af20599b4eaa926d8ea70f3f52656efd458c))
* filter collections view ([e5788e9](https://github.com/developmentseed/stac-map/commit/e5788e9c4517768a5867b272655c3dbabb8ec623))
* finish some stuff ([af37c4c](https://github.com/developmentseed/stac-map/commit/af37c4ce0ff79383d5f7673911aeb08b95c644e5))
* get single stac ([abd5978](https://github.com/developmentseed/stac-map/commit/abd59782be292884e71a1952f12ee4fa72feb16d))
* hovering ([64f1870](https://github.com/developmentseed/stac-map/commit/64f18703b18042455db44af36ff49f362a2b4ce5))
* it's loading ([1cc6402](https://github.com/developmentseed/stac-map/commit/1cc6402c7d98e5a1bb9d8056bef3d013395a1163))
* item search ([#49](https://github.com/developmentseed/stac-map/issues/49)) ([16bf481](https://github.com/developmentseed/stac-map/commit/16bf48114f50ecac6b075a04cb5ed0f5708d056f))
* load ([8016c4a](https://github.com/developmentseed/stac-map/commit/8016c4a6a9ba203e2df112e3ba2034aaa1825d29))
* load collections ([6bdb90a](https://github.com/developmentseed/stac-map/commit/6bdb90a31f43d7395868fe71b3b066fbcdea42ea))
* loading ([54fcb12](https://github.com/developmentseed/stac-map/commit/54fcb12af16c964308d8aebc7e07e7796d1ef7a0))
* markdown ([6cce480](https://github.com/developmentseed/stac-map/commit/6cce480872d038a68b353f2ee7b7b0511a635102))
* max items ([#19](https://github.com/developmentseed/stac-map/issues/19)) ([5bb31f2](https://github.com/developmentseed/stac-map/commit/5bb31f22a094f9fc4568c5af19afd2fe5b68f71b))
* metadata ([9847cda](https://github.com/developmentseed/stac-map/commit/9847cda334430283dbbdd061543886a204714d2b))
* moar ([d82bfcf](https://github.com/developmentseed/stac-map/commit/d82bfcf09cd958e9ba063ccb3772b028ed4ade9a))
* more examples ([ba3ee36](https://github.com/developmentseed/stac-map/commit/ba3ee3673b040f3d9909154844f4af68751aea32))
* more stuff ([c8ef6a1](https://github.com/developmentseed/stac-map/commit/c8ef6a15db0d06c75a1a160f8a5dcebe50b88bc9))
* more things! ([a405b18](https://github.com/developmentseed/stac-map/commit/a405b1844c40834d81b453e8f37ccabde4052ef1))
* move upload to top bar ([#87](https://github.com/developmentseed/stac-map/issues/87)) ([fa63982](https://github.com/developmentseed/stac-map/commit/fa639823539984763d55f017258a85d2dca141a3))
* next, pickables ([0f1a5a0](https://github.com/developmentseed/stac-map/commit/0f1a5a06a15ea94167cc4473e839c7502ac916ee))
* nicer ([b58f7c9](https://github.com/developmentseed/stac-map/commit/b58f7c9ba3cfd0d69a471650991142147f2dddce))
* non-working search ([#1](https://github.com/developmentseed/stac-map/issues/1)) ([3dbf8ad](https://github.com/developmentseed/stac-map/commit/3dbf8adf050bfb6f45460d4b6538530029bf81d0))
* picking better ([388d730](https://github.com/developmentseed/stac-map/commit/388d73013e2a68227240037b71ca1c339ec6a9d7))
* prelim natural language collection search ([#28](https://github.com/developmentseed/stac-map/issues/28)) ([41de5c4](https://github.com/developmentseed/stac-map/commit/41de5c406af5c977e1194159ffb4a92dcb729e76))
* put it in the provider ([8861ff6](https://github.com/developmentseed/stac-map/commit/8861ff6e2526d04e5ed8ee529a0e9c0f1559f277))
* put the type in the example ([b23cd41](https://github.com/developmentseed/stac-map/commit/b23cd419efa9c86597cff3b86a2921ce2e787ab1))
* refactor stac-geoparquet ([7cdc1ab](https://github.com/developmentseed/stac-map/commit/7cdc1abfc605578aeb645631348da7d00f2fa77e))
* refactor uploads ([007336c](https://github.com/developmentseed/stac-map/commit/007336cdfdba5bebc2aef5faef28dad66f5a3ca1))
* render visual cogs ([#166](https://github.com/developmentseed/stac-map/issues/166)) ([8317a1a](https://github.com/developmentseed/stac-map/commit/8317a1a5ff931a46cf3fd559a05c6ec2112e49a3))
* rework ([e6e0755](https://github.com/developmentseed/stac-map/commit/e6e07558754bdd3dec39bc48507255b425a890f9))
* rework breadcrumbs ([#103](https://github.com/developmentseed/stac-map/issues/103)) ([781b699](https://github.com/developmentseed/stac-map/commit/781b6998477c573f48cb7c1ad7a9f521d90755a0))
* rough search ([#2](https://github.com/developmentseed/stac-map/issues/2)) ([bf2a38d](https://github.com/developmentseed/stac-map/commit/bf2a38d046656515dcc3826e74577d8c588ef48d))
* set layers per tab ([#6](https://github.com/developmentseed/stac-map/issues/6)) ([50af637](https://github.com/developmentseed/stac-map/commit/50af6378dfb834041d3c9e1ad8f5e77801e726f2))
* show catalog ([90e2c90](https://github.com/developmentseed/stac-map/commit/90e2c90c7ca49a545080481aae6863bf52cfef94))
* simple start ([b680676](https://github.com/developmentseed/stac-map/commit/b680676a65c890272966a6fc013ee446eb0a5f38))
* simplify state, use accordion in panel ([#152](https://github.com/developmentseed/stac-map/issues/152)) ([48e3653](https://github.com/developmentseed/stac-map/commit/48e36538a5c95069df58fea426b998e96f773cbf))
* some refactoring ([2b1a08a](https://github.com/developmentseed/stac-map/commit/2b1a08a434c8b28f244f4e1cb999e11937895bd7))
* stac-map ([961b4c7](https://github.com/developmentseed/stac-map/commit/961b4c7d2a5362dcdc7fc7a24322dd8619ccb083))
* static catalogs ([#91](https://github.com/developmentseed/stac-map/issues/91)) ([a041563](https://github.com/developmentseed/stac-map/commit/a041563cc1f61ea6ee21c66e785faa490bcbc3a5))
* tab in state ([#10](https://github.com/developmentseed/stac-map/issues/10)) ([62cb349](https://github.com/developmentseed/stac-map/commit/62cb349d00ec132a0ae1b14793dc030b5134aa18))
* temporal filtering ([#150](https://github.com/developmentseed/stac-map/issues/150)) ([46cd096](https://github.com/developmentseed/stac-map/commit/46cd0966f89df28ed53355319121ac17c8ff3bc1))
* this is coming along ([9e05de4](https://github.com/developmentseed/stac-map/commit/9e05de4f41eb702e98c25b801511ed30ea101437))
* update asset key ([1b3faa7](https://github.com/developmentseed/stac-map/commit/1b3faa7c7dd1a61fba6e9ed70d53cfd072ea00f7))
* update readme ([4f93c65](https://github.com/developmentseed/stac-map/commit/4f93c659a1178c08145953a7db3abb2749868aa7))
* update search bar href ([8a683e2](https://github.com/developmentseed/stac-map/commit/8a683e231f239870cecfcdc58d7992900a03ad89))
* update url ([6b2938c](https://github.com/developmentseed/stac-map/commit/6b2938ccc0e408119cbdd38bda46b6a19e5bab83))
* updated breadcrumbs, replaces tabs ([#94](https://github.com/developmentseed/stac-map/issues/94)) ([578005a](https://github.com/developmentseed/stac-map/commit/578005a8585951e276a164afc4004cfbb86ca62e))
* uplaod json ([6c77705](https://github.com/developmentseed/stac-map/commit/6c7770542623c957a7f78503653868b04e3cc644))
* upload ([8662bc4](https://github.com/developmentseed/stac-map/commit/8662bc4ea2f62dc959aef67bac59ada6fe586924))
* use cards for collections ([#64](https://github.com/developmentseed/stac-map/issues/64)) ([79dbee2](https://github.com/developmentseed/stac-map/commit/79dbee276ae20c5496f404a7c229c59dbaa62555))
* use stat ([#46](https://github.com/developmentseed/stac-map/issues/46)) ([cfae045](https://github.com/developmentseed/stac-map/commit/cfae0455d2469c702890b73b8064ec3cfca6cbc7))
* use thumbnails ([b485927](https://github.com/developmentseed/stac-map/commit/b48592755e17ed8722c5861b8d8dec0a140196e1))
* workin it ([ac1f7e4](https://github.com/developmentseed/stac-map/commit/ac1f7e455e0bd2b1f68cc391b09ee7aa70e4c163))
* working ([02c8878](https://github.com/developmentseed/stac-map/commit/02c88780be7fed1f4a9c904801b0444d862c52f4))
* zoom to bounds ([19248ac](https://github.com/developmentseed/stac-map/commit/19248ac47e53a7d2cf0c479a7abbdfef29000d49))
* zoom to item ([6ff3401](https://github.com/developmentseed/stac-map/commit/6ff34015ccb6bd31266dc615c3b139bae7ed9b31))
* zoom when natural language searching ([#29](https://github.com/developmentseed/stac-map/issues/29)) ([a5199fd](https://github.com/developmentseed/stac-map/commit/a5199fd5b93daac726ab21694fbf01f8fbfccafe))


### Bug Fixes

* add an error boundary for each section ([#176](https://github.com/developmentseed/stac-map/issues/176)) ([9f5438f](https://github.com/developmentseed/stac-map/commit/9f5438f4fcb0e76228b4ff618d0fa584ddda93c5))
* add license ([1ac2a30](https://github.com/developmentseed/stac-map/commit/1ac2a30bf2b68fb8de1321583325b4143fd87957))
* also set visual when picking items ([#167](https://github.com/developmentseed/stac-map/issues/167)) ([30a3644](https://github.com/developmentseed/stac-map/commit/30a364424959d5c3fc1c67f6c7f5e50a6ca00408))
* always submit ([b842947](https://github.com/developmentseed/stac-map/commit/b842947e3dfd6d4f2fa09dc66bdbeca15811b3c6))
* another rename ([8fff903](https://github.com/developmentseed/stac-map/commit/8fff9036e9f9dcb1b4245a4c8495cae7b69011eb))
* better responsive ([#66](https://github.com/developmentseed/stac-map/issues/66)) ([2023b24](https://github.com/developmentseed/stac-map/commit/2023b24ed97ffff004bff6b8576209e4682c337b))
* better responsive design ([acba279](https://github.com/developmentseed/stac-map/commit/acba279e753ab0ee634f857c897f341cfaf14532))
* bold title ([7cc804e](https://github.com/developmentseed/stac-map/commit/7cc804ef4b4cadb5aec4b29ce18125517c40878d))
* building, ci ([ccdc330](https://github.com/developmentseed/stac-map/commit/ccdc3305ba7b502d44bb6abfacf0558cfab57a86))
* can't pick a single item ([#165](https://github.com/developmentseed/stac-map/issues/165)) ([385d6ce](https://github.com/developmentseed/stac-map/commit/385d6ced9f2a1da1d0cd612ed8b0180f5066e5db))
* change some text ([162da92](https://github.com/developmentseed/stac-map/commit/162da9233a9ba41a3928150e95a54dda34692abe))
* Check bbox value for list of lists ([#182](https://github.com/developmentseed/stac-map/issues/182)) ([3c0fa08](https://github.com/developmentseed/stac-map/commit/3c0fa0848485a89754a1a69e605543997a8c1bcb))
* ci workflows ([#113](https://github.com/developmentseed/stac-map/issues/113)) ([f64ae80](https://github.com/developmentseed/stac-map/commit/f64ae8009517de1393e2d0538698bfc4ec56ab55))
* **ci:** add 'Z' to the app deploy datetime ([f0aadf1](https://github.com/developmentseed/stac-map/commit/f0aadf1c13324771cb74e58d985ac5b429d28f49))
* **ci:** fetch-depth 0 for build job ([ab757d0](https://github.com/developmentseed/stac-map/commit/ab757d02131eac1abe2c7bf0d76eae689131e4cd))
* **ci:** remove assets from release ([4f20b82](https://github.com/developmentseed/stac-map/commit/4f20b8245f23ad23740ce514a2ad770575b600a1))
* clear items and picked when search changes ([e4c7a29](https://github.com/developmentseed/stac-map/commit/e4c7a293107a8917a258a5954947b00e7538f493))
* clear picked and items when value changes ([fa353f5](https://github.com/developmentseed/stac-map/commit/fa353f5017139f5c24531b89db3acea723b94245))
* collection rendering ([#20](https://github.com/developmentseed/stac-map/issues/20)) ([1738616](https://github.com/developmentseed/stac-map/commit/1738616e0644a7a4e8b2dab340eba0facb684103))
* collection search for collections too ([#118](https://github.com/developmentseed/stac-map/issues/118)) ([9a81194](https://github.com/developmentseed/stac-map/commit/9a811945c746f04da3d25614822553d50adc0ca3))
* **deps:** include conventional-changelog-conventionalcommits ([8570ccd](https://github.com/developmentseed/stac-map/commit/8570ccd0ac88156ef7562b6e988b6a280a1325a1))
* disable datetime slider if filter is false ([3787784](https://github.com/developmentseed/stac-map/commit/3787784634ea4bdc5497542c3de867ac40aab7b1))
* disable global collection search by default ([d228765](https://github.com/developmentseed/stac-map/commit/d228765daff0a93dc4b2698792360e1c2366978d))
* display item collections ([#125](https://github.com/developmentseed/stac-map/issues/125)) ([ea7cf3b](https://github.com/developmentseed/stac-map/commit/ea7cf3b9940dc855ff9b08f92e2920e0b7bc5cc0)), closes [#86](https://github.com/developmentseed/stac-map/issues/86)
* don't change on same href ([1de777d](https://github.com/developmentseed/stac-map/commit/1de777d9909dca2727f6e9fb5209901624b6e188))
* don't do that ([52528a4](https://github.com/developmentseed/stac-map/commit/52528a4d0fd8bb6d47683db50ea00458bbd4a4b0))
* don't pass datetime bounds if filtering is false ([8f979c0](https://github.com/developmentseed/stac-map/commit/8f979c0c928886f964405c279d9fedef028a1604))
* don't set bbox for empty feature collections ([#130](https://github.com/developmentseed/stac-map/issues/130)) ([4132eab](https://github.com/developmentseed/stac-map/commit/4132eab62b7467b0e1f9b74cbb7052e31c83451c)), closes [#129](https://github.com/developmentseed/stac-map/issues/129)
* don't trap focus in about panel ([b1fe505](https://github.com/developmentseed/stac-map/commit/b1fe505120870d51b59c970e7d42f8c5e184278f))
* double link ([3810a0f](https://github.com/developmentseed/stac-map/commit/3810a0fd192bb78bcc484fa61c7c5b46fbff4409))
* eslint ignore ui components ([4e8373b](https://github.com/developmentseed/stac-map/commit/4e8373ba406c9cbce5452a7e01d3a0d62f386afa))
* explicitly load DuckDB icu extension ([#175](https://github.com/developmentseed/stac-map/issues/175)) ([de5e862](https://github.com/developmentseed/stac-map/commit/de5e862dcb490a87427e4eb1f2a5d03426d3381c))
* format ([35c160c](https://github.com/developmentseed/stac-map/commit/35c160c8a921e658095368bc3cd31229024b81f7))
* handle invalid collection ([#37](https://github.com/developmentseed/stac-map/issues/37)) ([d0d307e](https://github.com/developmentseed/stac-map/commit/d0d307e29caea6d8f9b90ff27e3009c118e0ddcf))
* less useState and useEffect ([#90](https://github.com/developmentseed/stac-map/issues/90)) ([d40fc15](https://github.com/developmentseed/stac-map/commit/d40fc151335d831aa01ea01688352a132d8957c2))
* load invalid STAC values ([f2ad23e](https://github.com/developmentseed/stac-map/commit/f2ad23e73df5507d19d4556013aacd83986ee0ed))
* logic when fetching children ([3f89d04](https://github.com/developmentseed/stac-map/commit/3f89d04d425f44a57d4e769811e0a17fc6f5e7df))
* more permissive geotiff visualization ([#231](https://github.com/developmentseed/stac-map/issues/231)) ([5dbcd06](https://github.com/developmentseed/stac-map/commit/5dbcd06fedf79c13db5a9207a1fbe9540e6f915b))
* move max items into advanced ([#26](https://github.com/developmentseed/stac-map/issues/26)) ([c8d3490](https://github.com/developmentseed/stac-map/commit/c8d3490ad3de6dd3934cee74218022d9700a2aea))
* move natural language search up ([#100](https://github.com/developmentseed/stac-map/issues/100)) ([caf277a](https://github.com/developmentseed/stac-map/commit/caf277ab14e37498f1ac8fcce6bdefa663706c8a))
* name ([7f5e884](https://github.com/developmentseed/stac-map/commit/7f5e88494a9a9ad921d996c5687909577b103c70))
* nested p ([#65](https://github.com/developmentseed/stac-map/issues/65)) ([24806b1](https://github.com/developmentseed/stac-map/commit/24806b142da995429575beb54ff464d09926f9b6))
* only render BitmapLayer if data are available ([#211](https://github.com/developmentseed/stac-map/issues/211)) ([2aeba33](https://github.com/developmentseed/stac-map/commit/2aeba331b30f29d8b694803f73b5e150657e0638))
* poor collection, CORS ([8d47a0b](https://github.com/developmentseed/stac-map/commit/8d47a0b93a965902b76c9758f3ab28497c7b1a75))
* push empty parameters on empty href submit ([c30a7fd](https://github.com/developmentseed/stac-map/commit/c30a7fd27522589f2f17d6b0562af650696ad397))
* re-add color mode button ([#154](https://github.com/developmentseed/stac-map/issues/154)) ([bc8b011](https://github.com/developmentseed/stac-map/commit/bc8b011cc86afd0b5ac3df080b8b736e185004fd))
* re-add download ([#133](https://github.com/developmentseed/stac-map/issues/133)) ([a471d03](https://github.com/developmentseed/stac-map/commit/a471d03f590e8a07e6702b49c41b55e07b7f4281))
* re-add download buttons ([#155](https://github.com/developmentseed/stac-map/issues/155)) ([7a458d4](https://github.com/developmentseed/stac-map/commit/7a458d42fc7f9f9f275793da287fafe068690b48))
* re-add spatial collection filtering ([#140](https://github.com/developmentseed/stac-map/issues/140)) ([8277da3](https://github.com/developmentseed/stac-map/commit/8277da3b867a707ca644b887b0fd3e6c160d15bc)), closes [#55](https://github.com/developmentseed/stac-map/issues/55)
* re-add upload button ([#158](https://github.com/developmentseed/stac-map/issues/158)) ([6510652](https://github.com/developmentseed/stac-map/commit/651065227128f6f52de0796650b522c8edffef1b)), closes [#157](https://github.com/developmentseed/stac-map/issues/157)
* Remove fileUpload dep in useStacValue useEffect ([#177](https://github.com/developmentseed/stac-map/issues/177)) ([0fbd697](https://github.com/developmentseed/stac-map/commit/0fbd697bed0c14f1d4680f870faadc486d4b312d))
* remove geoparquet link from upload ([f671efa](https://github.com/developmentseed/stac-map/commit/f671efad536b6c49bcc0a8910747aefd3bcdf3c4))
* remove svg ([eb89600](https://github.com/developmentseed/stac-map/commit/eb896002b8cfef98876feaeffc1162c6105ead5e))
* rename casing ([5eb32c8](https://github.com/developmentseed/stac-map/commit/5eb32c8c98ec79facfad176e4452ef059ca33e1a))
* search over antimeridian ([#79](https://github.com/developmentseed/stac-map/issues/79)) ([4f673bd](https://github.com/developmentseed/stac-map/commit/4f673bdd7b6a98d3c9c09650c8914be629d54d45))
* select collections with natural language search ([#45](https://github.com/developmentseed/stac-map/issues/45)) ([df6ed5f](https://github.com/developmentseed/stac-map/commit/df6ed5f24407d93ac400f7fef998f98ab4a9474b))
* semantic-release ([#111](https://github.com/developmentseed/stac-map/issues/111)) ([f5804a6](https://github.com/developmentseed/stac-map/commit/f5804a6eb77eb9a22e46c3c8525f502ff7d34064))
* show linked items from static catalogs ([88ff32c](https://github.com/developmentseed/stac-map/commit/88ff32c325b7026064a7d9dc959450cb8d5d4fc8))
* show static catalogs on map ([4f6851a](https://github.com/developmentseed/stac-map/commit/4f6851a5ca28c92a8a45097aa5626400d62eacbb))
* slight customizations for white-label deployment ([#247](https://github.com/developmentseed/stac-map/issues/247)) ([8cb503a](https://github.com/developmentseed/stac-map/commit/8cb503aef1f8ca508d337ffa9c7558ce655a9bc4)), closes [#136](https://github.com/developmentseed/stac-map/issues/136)
* some light pending cleanup ([4e5b7b8](https://github.com/developmentseed/stac-map/commit/4e5b7b85d191ec15a9dca5604298a0fe86b252d5))
* switch order ([3f41940](https://github.com/developmentseed/stac-map/commit/3f41940b69b18875f21e88fd77190cb93304c335))
* title for links section ([#173](https://github.com/developmentseed/stac-map/issues/173)) ([70d4b01](https://github.com/developmentseed/stac-map/commit/70d4b016f0d5a7b9d4a126b423689f90dd7d3996))
* turn off debug for DuckDB ([35c4287](https://github.com/developmentseed/stac-map/commit/35c42878805c8ccfcd9423d9e369dbae28762634))
* unset table when not stac-geoparquet ([c6035ba](https://github.com/developmentseed/stac-map/commit/c6035ba300262745f38258dbcc6dcb93cd02e3d4))
* update readme ([48c9f8e](https://github.com/developmentseed/stac-map/commit/48c9f8eeec46b53e8dcc97e44f46583e4c94f111))
* url ([c7f681f](https://github.com/developmentseed/stac-map/commit/c7f681fc4047ad4eba276e64c7c1e5447453cd4b))
* use dvh and dvw ([7b7ee43](https://github.com/developmentseed/stac-map/commit/7b7ee43313e5d2d1faf2b8ab49b14055aa945644))
* useBreakpointValue for header position ([e268da6](https://github.com/developmentseed/stac-map/commit/e268da6e059f7ac71019e4d445388ce3ab4e68f1))
* viewport bounds search ([5060acc](https://github.com/developmentseed/stac-map/commit/5060acc5d03e43f9533018b1a3973389e981fc16))
* vite config ([5379802](https://github.com/developmentseed/stac-map/commit/5379802c080d37583d3bc17ae04e45c19fbd8d76))
* we got a stack ([f3068c5](https://github.com/developmentseed/stac-map/commit/f3068c5077e10c15f7f9afd280b9ff67b4d41673))
