
#Ez a háttér 
main_buffer = [[0, 0, 0, 0, 0],
               [0, 0, 0, 0, 0],
               [0, 0, 0, 0, 0],
               [0, 0, 0, 0, 0],
               [0, 0, 0, 0, 0]]

#Erre a koordinátára "spawnolnak" a formák
shape_position = [2.0, 0.0]

#Pont számláló
score = 0


#Az összes forma ilyen relatív "offset" szerint kódolva, azért vannak többször mert igy lehet állítani mennyi eséllyel jelenik meg
shapes = [[[0, 0], [0, 1], [-1, 1]], 
          [[0, 0], [0, 1], [1, 1]],
          [[0, 0], [0, 1]],
          [[0, 0], [0, 1]],
          [[0, 0], [0, 1]],
          [[0, 0], [1, 0]],
          [[0, 0]],
          [[0, 0]],
          [[0, 0]],
          [[0, 0], [1, 0]],
          [[0, 0], [0, 1], [-1, 0]],
          [[0, 0], [0, 1], [1, 0]]]


#Az első random forma kiválasztása
shape_id = randint(0, len(shapes) - 1)


#Az előző frame-ben le volt e nyomva a gomb
btnAprev = False
btnBprev = False


#időzítő
timer = 0


skip = 0

gameover = False


#Update loop
def main():
    global shape_id
    global timer
    global shape_position
    global skip


    #megnézzük lehet e lejjebb mozgatni a formát
    if not gameover:
        if input.running_time() - timer > 500:
            if check_bounds("bottom"):
                #ha lehet akkor lejjeb rakjuk eggyel
                timer = input.running_time()
                if skip == 0:
                    shape_position[1] += 1
                else:
                    skip = 0
            else:
                #ha nem lehet akkor "beleégetjük" a háttérbe és kérünk egy újjat és átugorjuk a kovetkező framet
                burn_shape()
                shape_id = randint(0, len(shapes) - 1)
                shape_position = [2.0, 0.0]
                skip = 1

        #megnézzük van e betelt sor
        check_fill()
        #a gombokat kezeljük
        input_handling()
        #kirajzoljuk a hátteret és rá a formát
        render()
        #megnézzük véget ért e a játék (függőlegesen betelt e)
        check_full()

#A render loop
def render():
    global shape_id


    shape_buffer = [[0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0]]

    render_buffer = [[0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0]]

    #A shapebufferbe beírjuk a shape-et a megfelelő koordinátára
    for pix in shapes[shape_id]:
        shape_buffer[pix[1] + Math.round(shape_position[1])][pix[0] + Math.round(shape_position[0])] = 1


    #átírjuk a render bufferbe
    for sy in range(len(shape_buffer)):
        for sx in range(len(shape_buffer[sy])):
            if shape_buffer[sy][sx] == 1:
                render_buffer[sy][sx] = 1

    #a hátteret is átírjuk a main-ből a render bufferbe
    for my in range(len(main_buffer)):
        for mx in range(len(main_buffer[my])):
            if main_buffer[my][mx] == 1:
                render_buffer[my][mx] = 1

    #kíírjuk hardware-re a render_buffert(a megfelelő ledeket bekapcsoljuk/kikapcsoljuk)
    for y in range(len(render_buffer)):
        for x in range(len(render_buffer[y])):
            if render_buffer[y][x] == 1:
                led.plot(x, y)
            else:
                led.unplot(x, y)


#ez a függvény megnézi hogy egy sorban csak egyesek vannak e
def all_ones(iterable):
    for item in iterable:
        if item != 1:
            return False
    return True

#Az "A" gomb lenyomásakor ha balra van hely akkor eggyel balra mozgatjuk a forma pozícióját
def OnA():
    if check_bounds("left") == True:
        shape_position[0] -= 1

#A "B" gomb lenyomásakor ha jobbra van hely akkor eggyel jobbra mozgatjuk a forma pozícióját
def OnB():
    if check_bounds("right") == True:
        shape_position[0] += 1

#Ez a gombok lenyomását és elengedését kezeli
def input_handling():
    global btnAprev
    global btnBprev

    #Ha az "A" gomb státusza változzott az előző framehez képest és le van mostmár nyomva akkor lefuttajuk az OnA()-t
    if input.button_is_pressed(Button.A) != btnAprev:
        btnAprev = input.button_is_pressed(Button.A)
        if btnAprev == True:
            OnA()

    #Ha a "B" gomb státusza változzott az előző framehez képest és le van mostmár nyomva akkor lefuttajuk az OnB()-t
    if input.button_is_pressed(Button.B) != btnBprev:
        btnBprev = input.button_is_pressed(Button.B)
        if btnBprev == True:
            OnB()

#ezzel tudjuk megnézni ha a formát elmozdítanánk egy adott irányba akkor túllépne e a kijelző szélén
#vagy rámenne a háttérben egy már lerakott formára
#ja kb csinálunk egy teszt rendert és megnézzük valid e
def check_bounds(side):
    global shape_id
    global main_buffer
    

    shape_bufferrr = [[0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0],
                      [0, 0, 0, 0, 0]]

    for pix in shapes[shape_id]:

        
        if side == "right":

            if pix[0] + Math.round(shape_position[0]) >= 4:

                return False
            
            shape_bufferrr[pix[1] + Math.round(shape_position[1])][pix[0] + Math.round(shape_position[0]) + 1] = 1

            for ssy in range(len(shape_bufferrr)):
                for ssx in range(len(shape_bufferrr[ssy])):
                    if main_buffer[ssy][ssx] == 1 and shape_bufferrr[ssy][ssx] == 1:
                        return False
            

        if side == "left":

            if pix[0] + Math.round(shape_position[0]) <= 0:

                return False
            
            shape_bufferrr[pix[1] + Math.round(shape_position[1])][pix[0] + Math.round(shape_position[0]) - 1] = 1

            for ssy in range(len(shape_bufferrr)):
                for ssx in range(len(shape_bufferrr[ssy])):
                    if main_buffer[ssy][ssx] == 1 and shape_bufferrr[ssy][ssx] == 1:
                        return False
        
        if side == "bottom":

            if pix[1] + Math.round(shape_position[1]) >= 4:

                return False
            


            shape_bufferrr[pix[1] + Math.round(shape_position[1]) + 1][pix[0] + Math.round(shape_position[0])] = 1

            for ssy in range(len(shape_bufferrr)):
                for ssx in range(len(shape_bufferrr[ssy])):
                    if main_buffer[ssy][ssx] == 1 and shape_bufferrr[ssy][ssx] == 1:
                        return False
        
                
    return True

#Ezzel lehet hozzáadni ("beleégetni") a formát a háttérbe
def burn_shape():
    global main_buffer
    global shape_id


    shape_bufferr = [[0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0],
                     [0, 0, 0, 0, 0]]

    
    for pixx in shapes[shape_id]:
        shape_bufferr[pixx[1] + Math.round(shape_position[1])][pixx[0] + Math.round(shape_position[0])] = 1

    for ssy in range(len(shape_bufferr)):
        for ssx in range(len(shape_bufferr[ssy])):
            if shape_bufferr[ssy][ssx] == 1:
                main_buffer[ssy][ssx] = 1

#Ezzel lehet megbézni betelt e egy sor
def check_fill():
    global main_buffer
    global score

    #Szorzó ha több sort sikerül egyszerre
    multi = 0

    rows = []

    #végigmegyünk a sorokon
    for row in range(len(main_buffer)):
        #megnézzük az all_ones-al hogy csak egyesek vannak e benne
        if all_ones(main_buffer[row]):
            #Ha igen akkor a szorzóhoz adunk egyet és kiszedjük azt a sort, a tetejére meg rakunk egy üreset
            multi += 1
            main_buffer[row] = [0, 0, 0, 0, 0]

            main_buffer.pop(row)

            rows.append(row)

            main_buffer.insert(0, [0, 0, 0, 0, 0])

    #hozzáadjuk a kiszámolt pontokat, 5 az alap megszorozva ahány sort sikerült egyszerre a négyzeten
    score += 5 * multi**2

    

    print(score)

#Ez a gameover score kíírást csinálja
def play_gameover():
    global main_buffer
    global gameover

    gameover = True

    main_buffer = [[0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0],
                   [0, 0, 0, 0, 0]]
    
    basic.clear_screen()

    while True:
        basic.show_number(score)


#Ez megnézi ha a fölső sorban van egy formának része a háttérben akkor gameover
def check_full():
    if 1 in main_buffer[0]:
        play_gameover()

#A maint örökké futtatjuk
while True:
    main()

