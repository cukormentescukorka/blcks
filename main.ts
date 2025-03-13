// Ez a háttér 
let main_buffer = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
// Erre a koordinátára "spawnolnak" a formák
let shape_position = [2.0, 0.0]
// Pont számláló
let score = 0
// Az összes forma ilyen relatív "offset" szerint kódolva, azért vannak többször mert igy lehet állítani mennyi eséllyel jelenik meg
let shapes = [[[0, 0], [0, 1], [-1, 1]], [[0, 0], [0, 1], [1, 1]], [[0, 0], [0, 1]], [[0, 0], [0, 1]], [[0, 0], [0, 1]], [[0, 0], [1, 0]], [[0, 0]], [[0, 0]], [[0, 0]], [[0, 0], [1, 0]], [[0, 0], [0, 1], [-1, 0]], [[0, 0], [0, 1], [1, 0]]]
// Az első random forma kiválasztása
let shape_id = randint(0, shapes.length - 1)
// Az előző frame-ben le volt e nyomva a gomb
let btnAprev = false
let btnBprev = false
// időzítő
let timer = 0
let skip = 0
let gameover = false
// Update loop
function main() {
    
    
    
    
    // megnézzük lehet e lejjebb mozgatni a formát
    if (!gameover) {
        if (input.runningTime() - timer > 500) {
            if (check_bounds("bottom")) {
                // ha lehet akkor lejjeb rakjuk eggyel
                timer = input.runningTime()
                if (skip == 0) {
                    shape_position[1] += 1
                } else {
                    skip = 0
                }
                
            } else {
                // ha nem lehet akkor "beleégetjük" a háttérbe és kérünk egy újjat és átugorjuk a kovetkező framet
                burn_shape()
                shape_id = randint(0, shapes.length - 1)
                shape_position = [2.0, 0.0]
                skip = 1
            }
            
        }
        
        // megnézzük van e betelt sor
        check_fill()
        // a gombokat kezeljük
        input_handling()
        // kirajzoljuk a hátteret és rá a formát
        render()
        // megnézzük véget ért e a játék (függőlegesen betelt e)
        check_full()
    }
    
}

// A render loop
function render() {
    
    let shape_buffer = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
    let render_buffer = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
    // A shapebufferbe beírjuk a shape-et a megfelelő koordinátára
    for (let pix of shapes[shape_id]) {
        shape_buffer[pix[1] + Math.round(shape_position[1])][pix[0] + Math.round(shape_position[0])] = 1
    }
    // átírjuk a render bufferbe
    for (let sy = 0; sy < shape_buffer.length; sy++) {
        for (let sx = 0; sx < shape_buffer[sy].length; sx++) {
            if (shape_buffer[sy][sx] == 1) {
                render_buffer[sy][sx] = 1
            }
            
        }
    }
    // a hátteret is átírjuk a main-ből a render bufferbe
    for (let my = 0; my < main_buffer.length; my++) {
        for (let mx = 0; mx < main_buffer[my].length; mx++) {
            if (main_buffer[my][mx] == 1) {
                render_buffer[my][mx] = 1
            }
            
        }
    }
    // kíírjuk hardware-re a render_buffert(a megfelelő ledeket bekapcsoljuk/kikapcsoljuk)
    for (let y = 0; y < render_buffer.length; y++) {
        for (let x = 0; x < render_buffer[y].length; x++) {
            if (render_buffer[y][x] == 1) {
                led.plot(x, y)
            } else {
                led.unplot(x, y)
            }
            
        }
    }
}

// ez a függvény megnézi hogy egy sorban csak egyesek vannak e
function all_ones(iterable: any[]): boolean {
    for (let item of iterable) {
        if (item != 1) {
            return false
        }
        
    }
    return true
}

// Az "A" gomb lenyomásakor ha balra van hely akkor eggyel balra mozgatjuk a forma pozícióját
function OnA() {
    if (check_bounds("left") == true) {
        shape_position[0] -= 1
    }
    
}

// A "B" gomb lenyomásakor ha jobbra van hely akkor eggyel jobbra mozgatjuk a forma pozícióját
function OnB() {
    if (check_bounds("right") == true) {
        shape_position[0] += 1
    }
    
}

// Ez a gombok lenyomását és elengedését kezeli
function input_handling() {
    
    
    // Ha az "A" gomb státusza változzott az előző framehez képest és le van mostmár nyomva akkor lefuttajuk az OnA()-t
    if (input.buttonIsPressed(Button.A) != btnAprev) {
        btnAprev = input.buttonIsPressed(Button.A)
        if (btnAprev == true) {
            OnA()
        }
        
    }
    
    // Ha a "B" gomb státusza változzott az előző framehez képest és le van mostmár nyomva akkor lefuttajuk az OnB()-t
    if (input.buttonIsPressed(Button.B) != btnBprev) {
        btnBprev = input.buttonIsPressed(Button.B)
        if (btnBprev == true) {
            OnB()
        }
        
    }
    
}

// ezzel tudjuk megnézni ha a formát elmozdítanánk egy adott irányba akkor túllépne e a kijelző szélén
// vagy rámenne a háttérben egy már lerakott formára
// ja kb csinálunk egy teszt rendert és megnézzük valid e
function check_bounds(side: string): boolean {
    let ssy: number;
    let ssx: number;
    
    
    let shape_bufferrr = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
    for (let pix of shapes[shape_id]) {
        if (side == "right") {
            if (pix[0] + Math.round(shape_position[0]) >= 4) {
                return false
            }
            
            shape_bufferrr[pix[1] + Math.round(shape_position[1])][pix[0] + Math.round(shape_position[0]) + 1] = 1
            for (ssy = 0; ssy < shape_bufferrr.length; ssy++) {
                for (ssx = 0; ssx < shape_bufferrr[ssy].length; ssx++) {
                    if (main_buffer[ssy][ssx] == 1 && shape_bufferrr[ssy][ssx] == 1) {
                        return false
                    }
                    
                }
            }
        }
        
        if (side == "left") {
            if (pix[0] + Math.round(shape_position[0]) <= 0) {
                return false
            }
            
            shape_bufferrr[pix[1] + Math.round(shape_position[1])][pix[0] + Math.round(shape_position[0]) - 1] = 1
            for (ssy = 0; ssy < shape_bufferrr.length; ssy++) {
                for (ssx = 0; ssx < shape_bufferrr[ssy].length; ssx++) {
                    if (main_buffer[ssy][ssx] == 1 && shape_bufferrr[ssy][ssx] == 1) {
                        return false
                    }
                    
                }
            }
        }
        
        if (side == "bottom") {
            if (pix[1] + Math.round(shape_position[1]) >= 4) {
                return false
            }
            
            shape_bufferrr[pix[1] + Math.round(shape_position[1]) + 1][pix[0] + Math.round(shape_position[0])] = 1
            for (ssy = 0; ssy < shape_bufferrr.length; ssy++) {
                for (ssx = 0; ssx < shape_bufferrr[ssy].length; ssx++) {
                    if (main_buffer[ssy][ssx] == 1 && shape_bufferrr[ssy][ssx] == 1) {
                        return false
                    }
                    
                }
            }
        }
        
    }
    return true
}

// Ezzel lehet hozzáadni ("beleégetni") a formát a háttérbe
function burn_shape() {
    
    
    let shape_bufferr = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
    for (let pixx of shapes[shape_id]) {
        shape_bufferr[pixx[1] + Math.round(shape_position[1])][pixx[0] + Math.round(shape_position[0])] = 1
    }
    for (let ssy = 0; ssy < shape_bufferr.length; ssy++) {
        for (let ssx = 0; ssx < shape_bufferr[ssy].length; ssx++) {
            if (shape_bufferr[ssy][ssx] == 1) {
                main_buffer[ssy][ssx] = 1
            }
            
        }
    }
}

// Ezzel lehet megbézni betelt e egy sor
function check_fill() {
    
    
    // Szorzó ha több sort sikerül egyszerre
    let multi = 0
    let rows = []
    // végigmegyünk a sorokon
    for (let row = 0; row < main_buffer.length; row++) {
        // megnézzük az all_ones-al hogy csak egyesek vannak e benne
        if (all_ones(main_buffer[row])) {
            // Ha igen akkor a szorzóhoz adunk egyet és kiszedjük azt a sort, a tetejére meg rakunk egy üreset
            multi += 1
            main_buffer[row] = [0, 0, 0, 0, 0]
            _py.py_array_pop(main_buffer, row)
            rows.push(row)
            main_buffer.insertAt(0, [0, 0, 0, 0, 0])
        }
        
    }
    // hozzáadjuk a kiszámolt pontokat, 5 az alap megszorozva ahány sort sikerült egyszerre a négyzeten
    score += 5 * multi ** 2
    console.log(score)
}

// Ez a gameover score kíírást csinálja
function play_gameover() {
    
    
    gameover = true
    main_buffer = [[0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0], [0, 0, 0, 0, 0]]
    basic.clearScreen()
    while (true) {
        basic.showNumber(score)
    }
}

// Ez megnézi ha a fölső sorban van egy formának része a háttérben akkor gameover
function check_full() {
    if (main_buffer[0].indexOf(1) >= 0) {
        play_gameover()
    }
    
}

// A maint örökké futtatjuk
while (true) {
    main()
}
