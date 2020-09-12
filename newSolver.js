const Status = {
    SOLVED: 'solved',
    IN_PROGRESS: 'in progress',
    IMPOSSIBLE: 'impossible'
}

class Grid {
    constructor(size,secW,secH,depth=0){
        this.size = size
        this.secW = secW
        this.secH = secH
        this.nSecsW = Math.floor(size/secW)
        this.nSecsH = Math.floor(size/secH)
        this.status = Status.IN_PROGRESS
        this.solved = []
        this.possible = []
        this.nSolved = 0
        this.queue = []
        this.depth = depth

        for (let i = 0; i < size; i++){
            let solvedRow = []
            let posRow = []
            for (let j = 0; j < size; j++){
                solvedRow.push(false)
                posRow.push(this.allNumbers())
            }
            this.solved.push(solvedRow)
            this.possible.push(posRow)
        }
    }

    load(sampleGrid){
        if (sampleGrid.length != this.size){
            return false
        }
        for (let row of sampleGrid){
            if (row.length != this.size){
                return false
            }
        }

        for (let i = 0; i < this.size; i++){
            for (let j = 0; j < this.size; j++){
                let n = sampleGrid[i][j]
                if (n != 0){
                    this.addToQueue(n,i,j)
                }
            }
        }

        return true
    }

    allNumbers() {
        return [...Array(this.size).keys()].map(x => x + 1)
    }

    printOut(showPossible=false){
        let display = []
        for (let i = 0; i < this.size; i++){
            let tempRow = []
            for (let j = 0; j < this.size; j++){
                if (this.solved[i][j]){
                    tempRow.push(this.possible[i][j][0])
                } else {
                    tempRow.push("?")
                }
            }
            display.push(tempRow)
        }

        console.log("TODO")
    }

    writeIn(n,x,y){
        if (this.solved[x][y]){
            if (this.possible[x][y][0] != n){
                this.status = Status.IMPOSSIBLE
                this.nSolved = 0
                return false
            } else {
                return true
            }
        }

        this.solved[x][y] = true
        this.possible[x][y] = [n]
        this.nSolved++

        console.log([this.depth,x,y,n])

        if (this.nSolved == this.size*this.size){
            this.status = Status.SOLVED
            return true
        }

        for (let j = 0; j < this.size; j++){
            if (j == y){
                continue
            }
            let index = this.possible[x][j].indexOf(n)
            if (index != -1){
                this.possible[x][j].splice(index,1)
                if (this.possible[x][j].length == 0){
                    this.status = Status.IMPOSSIBLE
                    this.nSolved = 0
                    return false
                } else if ((this.possible[x][j].length == 1) && !(this.solved[x][j])){
                    this.addToQueue(this.possible[x][j][0],x,j)
                }
            }
        }

        for (let i = 0; i < this.size; i++){
            if (i == x){
                continue
            }
            let index = this.possible[i][y].indexOf(n)
            if (index != -1){
                this.possible[i][y].splice(index,1)
                if (this.possible[i][y].length == 0){
                    this.status = Status.IMPOSSIBLE
                    this.nSolved = 0
                    return false
                } else if ((this.possible[i][y].length == 1) && !(this.solved[i][y])){
                    this.addToQueue(this.possible[i][y][0],i,y)
                }
            }
        }

        let tl = this.getTLofSec(x,y)
        for (let i = 0; i < this.secH; i++){
            for (let j = 0; j < this.secW; j++){
                if ((tl[0]+i == x) && (tl[1]+j == y)){
                    continue
                }
                let index = this.possible[tl[0]+i][tl[1]+j].indexOf(n)
                if (index != -1){
                    this.possible[tl[0]+i][tl[1]+j].splice(index,1)
                    if (this.possible[tl[0]+i][tl[1]+j].length == 0){
                        this.status = Status.IMPOSSIBLE
                        this.nSolved = 0
                        return false
                    } else if ((this.possible[tl[0]+i][tl[1]+j].length == 1) && !(this.solved[tl[0]+i][tl[1]+j])){
                        this.addToQueue(this.possible[tl[0]+i][tl[1]+j][0],tl[0]+i,tl[1]+j)
                    }
                }
            }
        }

        return true
    }

    getTLofSec(x,y){
        let i = this.secH * Math.floor(x/this.secH)
        let j = this.secW * Math.floor(y/this.secW)
        return [i,j]
    }

    addToQueue(n,x,y){
        this.queue.push([n,x,y])
    }

    solveByElimination() {
        let currentSolved = this.nSolved
        for (let i = 0; i < this.size; i++){
            let row = []
            for (let j = 0; j < this.size; j++){
                row.push([i,j])
            }
            this.solveGroup(row)
        }

        for (let j = 0; j < this.size; j++){
            let col = []
            for (let i = 0; i < this.size; i++){
                col.push([i,j])
            }
            this.solveGroup(col)
        }

        for (let x = 0; x < this.nSecsH; x++){
            for (let y = 0; y < this.nSecsW; y++){
                let tlX = this.secH * x
                let tlY = this.secW * y
                let sec = []
                for (let i = 0; i < this.secH; i++){
                    for (let j = 0; j < this.secW; j++){
                        sec.push([tlX+i,tlY+j])
                    }
                }
                this.solveGroup(sec)
            }
        }

        return (this.nSolved > currentSolved)
    }

    solveGroup(group){
        let numbers = this.allNumbers()
        let emptys = []
        for (let pos of group){
            if (this.solved[pos[0]][pos[1]]){
                let index = numbers.indexOf(this.possible[pos[0]][pos[1]][0])
                if (index != -1){
                    numbers.splice(index,1)
                } else {
                    this.status = Status.IMPOSSIBLE
                    return false
                }
            } else {
                emptys.push(pos)
            }
        }

        for (let n of numbers){
            let chosen = null
            let found = false
            for (let pos of emptys){
                if (this.solved[pos[0]][pos[1]]){
                    continue
                }
                if (this.possible[pos[0]][pos[1]].includes(n)){
                    if (found){
                        found = false
                        break
                    } else {
                        chosen = pos
                        found = true
                    }
                }
            }
            if (found){
                this.writeIn(n,chosen[0],chosen[1])
                this.doQueue()
            }
        }

        return true
    }

    doQueue() {
        let currentSolved = this.nSolved
        while (this.queue.length != 0){
            let curr = this.queue[0]
            this.writeIn(curr[0],curr[1],curr[2])
            this.queue.shift()
        }
        return (this.nSolved > currentSolved)
    }

    clone() {
        let newGrid = new Grid(this.size,this.secW,this.secH,this.depth+1)
        for (let i = 0; i < this.size; i++){
            for (let j = 0; j < this.size; j++){
                if (this.solved[i][j]){
                    newGrid.writeIn(this.possible[i][j][0],i,j)
                }
            }
        }
        return newGrid
    }

    getNatXY(x,y){
        if (this.solved[x][y]){
            return this.possible[x][y][0]
        } else {
            return 0
        }
    }

    getStatus(){
        return self.status
    }

    adapt(otherGrid){
        for (let i = 0; i < this.size; i++){
            for (let j = 0; j < this.size; j++){
                this.writeIn(otherGrid.getNatXY(i,j),i,j)
            }
        }
        this.status = otherGrid.getStatus()
    }

    solveByGuess(){
        if (this.status != Status.IN_PROGRESS){
            return false
        }

        let changed = false
        for (let i = 0; i < this.size; i++){
            for (let j = 0; j < this.size; j++){
                if (!this.solved[i][j] && this.possible[i][j].length <= 4){
                    let works = -1
                    let nWorks = 0
                    for (let n of this.possible[i][j]) {
                        let tempGrid = this.clone()
                        tempGrid.writeIn(n,i,j)
                        console.log(["Guessing",this.depth,n,i,j])
                        let status = tempGrid.solve()
                        // console.log(JSON.parse(JSON.stringify(status)));
                        // let status = tempGrid.getStatus()
                        if (status == 'solved'){
                            nWorks = 1
                            this.adapt(tempGrid)
                            return true
                        }
                        if (tempGrid.solve() != Status.IMPOSSIBLE){
                            nWorks++
                            works = n
                            if (nWorks >= 2){
                                break
                            }
                        }
                    }

                    if (nWorks == 1){
                        changed = true
                        this.writeIn(works,i,j)
                        let progress = true
                        while (progress){
                            progress = this.doQueue() || this.solveByElimination()
                        }
                    }
                }
            }
        }

        return changed
    }

    solve() {
        let progress = true
        while (progress){
            console.log("going")
            progress = this.doQueue() || this.solveByElimination()
        }

        if (this.status == Status.IN_PROGRESS){
            console.log("Done all logical steps")
            if (this.depth < 2){
                this.solveByGuess()
            }
        }

        return this.status
    }

    getGrid() {
        let ret = []
        for (let i = 0; i < this.size; i++){
            let row = []
            for (let j = 0; j < this.size; j++){
                if (this.solved[i][j]){
                    row.push(this.possible[i][j][0])
                } else {
                    row.push(0)
                }
            }
            ret.push(row)
        }
        return ret
    }
}

function main(){
    let evilNumbers = [
        [0,0,0,5,0,8,0,2,0],
        [0,8,0,6,0,0,0,0,9],
        [0,3,5,4,0,0,7,0,0],
        [0,9,0,7,1,4,0,0,5],
        [0,0,0,0,0,0,9,0,0],
        [0,0,8,0,0,0,0,0,0],
        [0,0,0,0,0,0,1,5,0],
        [0,5,4,0,0,0,0,0,0],
        [6,0,3,0,0,2,0,0,8]
    ]
    let mainGrid = new Grid(9,3,3)
    mainGrid.load(evilNumbers)
    mainGrid.solve()
    console.log(mainGrid.getGrid())
}