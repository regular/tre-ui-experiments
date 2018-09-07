require('setimmediate')
const h = require('mutant/html-element')
const MutantArray = require('mutant/array')
const MutantMap = require('mutant/map')
const Value = require('mutant/value')
const watch = require('mutant/watch')
const computed = require('mutant/computed')

const items = [
  Value({a:30, n:'a'}),
  Value({a:10, n:'c'}),
  Value({a:20, n:'b'})
]

const byName = (a,b) => a.n == b.n ? 0 : a.n > b.n ? 1 : -1
const byNumber = (a,b) => a.a == b.a ? 0 : a.a > b.a ? 1 : -1
const criteria = Value(byNumber)

function comparer(a, b) {
  if (a === b) return true
  return false
}

function render(x) {
  console.log(`render ${x.a, x.n}`)
  return h(`div.bla-${x.n}`, `${x.a}: ${x.n}`)
}

const arr = MutantArray(items)
const sortedArray = computed([arr, criteria], (a, c) => {
  console.log(`sort ${JSON.stringify(a)}`)
  return a.sort(c)
})
const sortedElements = MutantMap(sortedArray, render, {comparer})

function makeSortButton(label, sorter) {
  return h(
    'button', {
      'classList': computed(
        [criteria], 
        c => c == sorter ? ['active'] : ['inactive']
      ),
      'ev-click': ()=> criteria.set(sorter)
    },
    label
  )
}

function makeSortDropDown(sorters) {
  return h(
    'select.sort', {
      'ev-change': e => {
        const i = Number(e.target.value)
        criteria.set(sorters[i].sortf)
      }
    },
    sorters.map(
      ({label}, i) => h(
        'option', {
          attributes: {
            value: i,
            selected: computed(
              [criteria],
              c=> c==sorters[i].sortf ? 'selected' : undefined
            )
          }
        }, 
        label
      ) 
    )
  )
}

document.body.appendChild(
  h('style', `
    .active {
      background: lightblue;
    }
    select.sort {
      font-size: .6em;
    }
  `)
)

document.body.appendChild(
  h('div', [
    makeSortDropDown([
      {label: 'by Name',   sortf: byName},
      {label: 'by Number', sortf: byNumber}
    ]),
    h('.container', sortedElements)
  ])
)

arr.push({a:15, n:'foo'}) // calls render
items[2].set({a:80, n:'d'}) 
criteria.set(byName)
