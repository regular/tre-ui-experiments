require('setimmediate')
const h = require('mutant/html-element')
const MutantArray = require('mutant/array')
const MutantMap = require('mutant/map')
const Value = require('mutant/value')
const watch = require('mutant/watch')
const computed = require('mutant/computed')

const items = [
  Value({id: 0, a:30, n:'a'}),
  Value({id: 1, a:10, n:'c'}),
  Value({id: 2, a:20, n:'b'})
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
  return h(
    `div.bla-${x.n}`, {
      draggable: true,
      //'data-id': x.id,
      'ev-dragstart': e => {
        e.target.classList.add('dragged')
        e.dataTransfer.setData('text/plain', x.id);
      },
      'ev-dragend': e => {
        e.target.classList.remove('dragged')
        const els = document.body.querySelectorAll('[draggable].over')
        ;[].slice.call(els).forEach( el=>el.classList.remove('over'))
      },
      'ev-dragenter': e => e.target.classList.add('over'),
      'ev-dragleave': e => e.target.classList.remove('over'),
      'ev-dragover': e => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
        const bb = e.target.getBoundingClientRect()
        const rely = (e.clientY - bb.top) / bb.height
        let cls = ['above', 'below']
        if (rely > 0.5) cls = cls.reverse()
        e.target.classList.add(cls[0])
        e.target.classList.remove(cls[1])
        return false
      },
      'ev-drop': e => {
        e.stopPropagation()
        const dropped_id = e.dataTransfer.getData('text/plain')
        const where = e.target.classList.contains('above') ? 'above' : 'below'
        if (`${dropped_id}` == `${x.id}`) {
          console.log(`dropped ${x.id} onto itself.`)
          return false
        }
        sortedArray.find( o=>String(o.id)==dropped_id)
        console.log(`dropped ${dropped_id} ${where} ${x.id}`)
        return false
      }
    },
    `#${x.id} / ${x.a}: ${x.n}`
  )
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
    [draggable] {
      user-select: none;
      cursor: move;
    }
    [draggable].dragged {
      opacity: 0.3
    }
    [draggable].over {
      //border: 1px dashed black;
    }
    [draggable].over.above {
      border-top: 1em solid blue;
      //padding-top: 1em;
    }
    [draggable].over.below {
      border-bottom: 1em solid blue;
      //padding-bottom: 1em;
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

arr.push({id: 'new', a:15, n:'foo'}) // calls render
items[2].set({id:2, a:80, n:'d'}) 
criteria.set(byName)
