# Enciclopedia Fonti di Riferimento

Questa pagina raccoglie le fonti usate dal progetto per evitare dipendenze da una sola sorgente.

## Priorita Generali

1. fonte ufficiale o API strutturata
2. database affidabile e aggiornato
3. guida editoriale di supporto
4. fonte visuale o storica per colmare buchi

## Carte

### TCGdex
- URL: `https://api.tcgdex.net/v2/en/series/tcgp`
- Uso: base primaria per set, carte, metadati, immagini e struttura dati
- Punti forti: API strutturata, facile da sincronizzare, buona copertura del catalogo
- Limiti: a volte set recenti o immagini possono arrivare in ritardo o con asset rotti

### Serebii
- URL: `https://www.serebii.net/tcgpocket/`
- Uso: fallback per immagini carte, dettagli extra, reward e pagine set
- Punti forti: copertura molto ampia, reward e customisation molto curate
- Limiti: HTML da parsare, nomenclature non sempre uniformi, nessuna API ufficiale

### Pokemon Zone
- URL: `https://www.pokemon-zone.com/sets/`
- Uso: controllo incrociato su set, quantità carte, themed collections e pagine archivio
- Punti forti: buona copertura editoriale dei set
- Limiti: meno strutturata di un'API

### PokemonTCGPocket.app
- URL: `https://pokemontcgpocket.app/`
- Uso: verifica set e card list quando serve un terzo riscontro
- Punti forti: archivio visivo e navigazione semplice
- Limiti: copertura e formati da verificare caso per caso

### Game8
- URL: `https://game8.co/games/Pokemon-TCG-Pocket`
- Uso: conferma rarita, guide singole, deck guide, missioni, reward, eventi
- Punti forti: ottimo supporto editoriale e guide pratiche
- Limiti: non e la fonte migliore come database primario completo

## Mazzi

### Limitless Pocket
- URL: `https://play.limitlesstcg.com/decks?game=pocket`
- Uso: fonte primaria per meta competitivo, archetipi, winrate, share, risultati torneo
- Punti forti: dati competitivi concreti e attendibili
- Limiti: non sempre offre una spiegazione editoriale o una lista "guida" pronta per ogni archetipo

### Game8
- URL: `https://game8.co/games/Pokemon-TCG-Pocket/archives/477754`
- Uso: tier list, deck guide, spiegazioni dei mazzi, contenuti per CPU e missioni
- Punti forti: ottima parte editoriale
- Limiti: i dati competitivi sono meno quantitativi di Limitless

### PokemonMeta
- URL: `https://www.pokemonmeta.com/`
- Uso: riferimento strutturale per pagine meta, archetipi e hub di navigazione
- Punti forti: impianto da portale meta
- Limiti: disponibilita contenuti e stabilita da verificare nel tempo

## Ricompense

### Serebii Customisation
- Emblems: `https://www.serebii.net/tcgpocket/emblems.shtml`
- Coins: `https://www.serebii.net/tcgpocket/coins.shtml`
- Sleeves: `https://www.serebii.net/tcgpocket/sleeves.shtml`
- Playmats: `https://www.serebii.net/tcgpocket/playmats.shtml`
- Display Boards: `https://www.serebii.net/tcgpocket/displays.shtml`
- Icons: `https://www.serebii.net/tcgpocket/icons.shtml`
- Binders: `https://www.serebii.net/tcgpocket/binders.shtml`
- Uso: fonte primaria per reward, immagini e metodi di ottenimento
- Punti forti: miglior copertura trovata per customisation e ricompense
- Limiti: parsing HTML necessario

### Game8 Event Guides
- URL base: `https://game8.co/games/Pokemon-TCG-Pocket`
- Uso: verifica date evento, missioni, availability e ricompense temporanee
- Punti forti: buone guide sugli eventi e sui reward time-limited
- Limiti: frammentazione in molte pagine singole

## Sprite e artwork Pokemon

### PokeAPI official artwork
- URL: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/`
- Uso: artwork e sprite dei Pokemon per i mazzi e i riferimenti visuali
- Punti forti: copertura ampia, utilissima per forme speciali e Mega
- Limiti: non e una fonte specifica per Pokemon Pocket

## Regola pratica del progetto

- Se `TCGdex` e completo, usare `TCGdex`
- Se `TCGdex` ha buchi o asset rotti, integrare con `Serebii`
- Per spiegazioni, meta, missioni ed eventi usare supporto `Game8`
- Per dati competitivi reali usare `Limitless`
- Per controlli incrociati usare `Pokemon Zone` o `PokemonTCGPocket.app`
