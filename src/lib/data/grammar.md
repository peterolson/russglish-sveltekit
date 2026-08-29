# Grammar

Russglish has almost no vocabulary in common between its two parents outside the
Greek/Latin international stratum — the closed classes especially. English _the_,
_of_, _that_, _was_ and Russian _который_, _был_, _его_ have no shared shape to
converge on, and no amount of respelling will produce one.

So the grammar does not translate the function words. It **replaces them with
structure**: word order, punctuation, repetition, and a handful of particles that
do converge. What follows is the record of those decisions, in the order a
sentence uses them.

Everything here is illustrated from `texts/bible/genesis/genesis-1.json`, which is
where the rules were actually settled.

---

## No articles

There is nothing to converge. English has three (_a_, _an_, _the_) and Russian has
none, so Russglish has none.

> `Start períod, Allah creativáte atmosphera plus planet.`
> _In the beginning God created the heaven and the earth._

## No inflection

Nouns do not decline or take a plural; verbs do not conjugate or take a tense.
A word is one shape everywhere.

> `Y fundamént go separáte woda ex woda.`
> _and let it divide the waters from the waters_

`woda` is both _water_ and _waters_ — and both _воду_ (accusative) and _воды_
(genitive), which is the same sentence asking Russian for two different endings.
Number and case are read from context, as they are in English for _sheep_ or
_fish_.

Tense is likewise unmarked. `Allah declaráte` is _God said_, not _God says_; the
narrative is past because the text is a narrative.

## The em dash is the copula

Russglish has no verb "to be" in a linking sense. A dash joins subject to
predicate, in any tense.

> `Planet — null forma.` — _the earth was without form_
> `Illumination — tip-top.` — _the light was good_
> `Obscuration — super vácuum.` — _darkness was upon the deep_

This is the one device both parents already own. Russian **writes** exactly this
dash where it drops the present-tense copula (_Москва — столица_), and an English
reader takes a dash as apposition and supplies the _is_ without being asked.

## `start` is the existential

The same word does _to begin_ and _to come to be_, which lets a fiat and its
fulfilment use one verb.

> `Go start illumination. Y illumination start.`
> _Let there be light: and there was light._

## `go` — the irrealis particle

`go` marks a verb as commanded, permitted or wished rather than reported. It is
**preverbal**, not clause-initial: it sits against the verb it governs, and where
there is an explicit subject, the subject leads.

> `Go start fundamént inter woda.` — no subject, so the particle opens the clause
> `Y fundamént go separáte woda ex woda.` — subject first, particle against its verb

Dropping `go` is what makes the thing happen. That is the whole of Russglish mood:
the fiat and its fulfilment are the same words, and only the particle differs.

## Repetition where a pronoun would go

Russglish has no pronouns and no demonstratives — none converge. Where a source
uses one, the noun is simply said again.

> `Y Allah visualáte illumination; illumination — tip-top.`
> _And God saw the light, that it was good._

The semicolon carries the subordination that _that_ would have carried. This costs
less than it looks like it should, because the repeated noun is usually only a word
or two from its antecedent.

## `y` and `plus` are not the same "and"

Both mean _and_; they are not interchangeable.

|        | joins                  |                     |      |
| ------ | ---------------------- | ------------------- | ---- |
| `y`    | clauses, sequentially  | _and then_          | и    |
| `plus` | terms, within a clause | logical conjunction | плюс |

> `Y dayn-finále plus dayn-stárt — premiér dayn.`
> _And the evening and the morning were the first day._

The first _and_ opens a new clause and is `y`; the second joins two nouns inside
one and is `plus`. English spells both _and_ and cannot tell them apart.

## Prepositions

The ones that converge are Latin, and they are few:

|         |                          |                    |
| ------- | ------------------------ | ------------------ |
| `ex`    | from, out of             | separation, source |
| `super` | above, over, upon        |                    |
| `inter` | between, in the midst of |                    |
| `pro`   | for, for the purpose of  | purpose            |

Where none fits, the relation goes to punctuation or to word order instead.

### `pro` takes a verb as readily as a noun

Purpose is the one relation where the two parents build the phrase out of
different parts of speech. English uses an infinitive, _to divide_; Russian uses
a deverbal noun, _для отделения_. There is no shape that is both.

Since a Russglish word has one form everywhere, `pro` simply governs what it is
given, and each reader recovers their own construction:

> `pro separáte dayn ex noct` — _to divide the day from the night_ · _для отделения дня от ночи_
> `pro signál plus sezón` — _for signs, and for seasons_ · _для знамений, и времён_

An English reader takes `pro separáte` as _for to divide_, which is what the
King James itself says elsewhere; a Russian reader takes «про сепара́ть» as the
_для_ + noun it is spelled like. The same word then does the plain nominal job in
`pro signál`, where both parents agree.

This is the only preposition that governs a verb, and it is why: prepositions are
otherwise prefix operators taking a noun (see **Word order** below).

## Punctuated offsets, not coordination

Where a source strings clauses together, Russglish prefers to stop.

> `Planet — null forma; vacuum.`
> _the earth was without form, and void_

`plus` was rejected here: it is a logical connective joining terms, and pressing it
into service as discourse glue blurs the one distinction that makes it worth
having.

## Two joiners: the interpunct makes a word, the hyphen makes a phrase

### `·` — lexical compound

Where no single word converges, two are joined into a new one. The interpunct is
not decorative: `decodeNeutral` gives each half its own stress domain, and
`lexicon.ts` checks by concatenation that the parts really do produce the whole.

> `dayn·stárt` (day + start) — morning
> `dayn·finále` (day + finale) — evening
> `tip·top` — good, in order

Both halves already existed for other reasons, which is the test of whether a
compound is worth making. A compound is a **headword**: its own lexicon entry, its
own gloss, and a `derivedFrom` the checker verifies.

### `-` — syntactic group

Several ordinary words acting as **one modifier**. Head-finality alone leaves this
ambiguous once three nouns stack up — `self type frukt` could bracket either way —
so the hyphen binds the ones that go together.

> `frúctate self-type frukt` — yielding fruit after its own kind

It is a parsing aid and nothing more. Separate words already have separate stress
domains, so unlike the interpunct it changes no phonology, and it earns **no
lexicon entry**: `self-type` is `self` + `tYp`, both already headwords, and the
composition stays visible on the page.

### The hyphen separates adjectival from adverbial

Because only NOMINAL modifiers are head-final — verbs are infix operators, see
below — binding a prepositional phrase says it modifies the noun after it, and
leaving it loose says it modifies the verb. The mark is the only thing carrying
that distinction, in a language with neither cases nor relative pronouns.

|                      |            |                                 |
| -------------------- | ---------- | ------------------------------- |
| `inter woda`         | adverbial  | where the firmament comes to be |
| `sub-fundamént woda` | adjectival | which waters are meant          |

Genesis 1:6 and 1:7 need it in consecutive verses. In 6 the firmament does not yet
exist — יְהִי רָקִיעַ בְּתוֹךְ הַמָּיִם, _let there be a firmament in the midst of the
waters_ — and a thing cannot be described as "the between-the-waters firmament"
before there is one to describe. The phrase is part of what is commanded.

By 7 it exists, and _the waters which were under the firmament_ picks out which
waters are meant from a referent already in hand. Same preposition, same nouns,
different work — and only the hyphen shows it.

### Why round this way

The interpunct is the narrower mark, so a compound sits tighter on the page than a
phrase does — which is what it is, one word rather than several read together. A
hyphen says _read these together_; an interpunct says _this is one word_.

## Verbs come in two shapes

A verb is either a **bare stem** or an **-At derivation**.

> `start`, `colléct` — already verbs in both parents, taken as they stand
> `creativáte`, `declaráte`, `separáte`, `nomencláte` — built with -ate/-ать

The suffix earns its keep where the borrowed root is not itself a verb, or where a
column needs the ending to show that it is one — Russian -ать, with its soft sign,
makes verbhood visible in a way a bare stem cannot.

Neither shape conjugates or carries tense; see **No inflection** above.

## Discourse formulae

The hardest words to converge are the emptiest ones. A phrase like _and it was so_
/ _и стало так_ carries almost no content — it is the biblical _so yeah_, _that's
that_ — and neither language's version has a shape the other could borrow.

Where such a formula has an international equivalent, Russglish takes it whole
rather than translating the parts:

> `...separáte woda ex woda. Fact.`
> _...divided the waters from the waters: and it was so._

Both parents already use the bare noun this way: «Факт.» is _indeed, that is so_,
and English _Fact._ stands alone the same way. Nothing is calqued; the formula is
replaced by a formula that does the same job.

## Word order: head-final, except for infix operators

The default is **head-final** — what modifies comes before what it modifies.

> `premiér dayn` — first day
> `null forma` — without form
> `dayn-stárt` — the day's start, morning
> `sub fundamént woda` — the water under the firmament

The exceptions are **operators, which sit between their operands**:

|              | between               |                           |
| ------------ | --------------------- | ------------------------- |
| verbs        | subject and object    | `Allah creativáte planet` |
| conjunctions | conjuncts             | `atmosphera plus planet`  |
| the dash     | subject and predicate | `illumination — tip-top`  |

Prepositions are a third case: prefix operators, taking the noun after them. The
phrase they build is then head-final against its own head — `[sub fundamént] woda`.
(`pro` is the exception, and takes a verb where the source does; see
**Prepositions** above.)

Being head-final is what lets the language shed relative clauses, which is worth
more than it sounds. Verse 7 needs _the waters which were under the firmament_ and
_воду, которая под твердью_ — a relative pronoun and a copula that neither parent
shares — and says `sub fundamént woda` instead, with no subordination at all.

A fiat has no subject, so its verb comes first by default rather than by rule (see
`go` above). Both parents allow verb-initial imperatives (_Let there be_, _да
будет_), so that order is native to neither speaker and strange to neither.
