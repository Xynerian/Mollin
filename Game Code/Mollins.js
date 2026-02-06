const version = 0.01;

getSave = function (doAlert = true) {
    const saveData = JSON.parse(localStorage.getItem("mollinSave"));
    if (saveData) {
        console.log("Fetching game data:", saveData);
        return saveData;
    } else if (doAlert) {
        alert("No save data found.");
    }
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let playMusic = false;
let playingSong = "mainTheme";

function switchMusic(song) {
    if (playingSong === song) return;

    const audio = document.getElementById("music");
    const source = document.getElementById("musicSource");
    playingSong = song;
    source.src = `../Audio/${song}.wav`;
    if (playMusic) {
        audio.load();
        audio.play().catch(() => { });
    }
}


function Mollin(maxHealth, maxTemp, minTemp, lifetime, maxHunger = 50, mutateChance = 10, foodChance = 15, generation = 1) {
    const mollin = this;
    mollin.attributes = {
        maxHealth: maxHealth,
        maxTemp: maxTemp,
        minTemp: minTemp,
        maxHunger: maxHunger,
        mutateChance: mutateChance,
        foodChance: foodChance,
        lifetime: lifetime
    };
    mollin.status = {
        health: mollin.attributes.maxHealth / 2,
        temp: (minTemp + maxTemp) / 2,
        hunger: mollin.attributes.maxHunger / 2,
        age: 0,
        generation: generation
    }

    mollin.tickSpeed = 500;
    mollin.paused = false;
    mollin.updateUI = function () {
        document.getElementById("maxHealth").innerText = `Max Health: ${mollin.attributes.maxHealth}`;
        document.getElementById("health").innerText = `Health: ${Math.round(mollin.status.health)}`;
        document.getElementById("temp").innerText = `Current Temperature: ${mollin.status.temp}°F`;
        document.getElementById("age").innerText = `Age: ${mollin.status.age}`;
        document.getElementById("tempRange").innerText = `Temperature Range: ${mollin.attributes.minTemp} - ${mollin.attributes.maxTemp}°F`;
        document.getElementById("lifetime").innerText = `Lifetime: ${mollin.attributes.lifetime}`;
        document.getElementById("generation").innerText = `Generation: ${mollin.status.generation}`;
        document.getElementById("maxHunger").innerText = `Maximum Food: ${mollin.attributes.maxHunger}`;
        document.getElementById("foodChance").innerText = `Food Chance: ${mollin.attributes.foodChance}%`;
        document.getElementById("hunger").innerText = `Food: ${mollin.status.hunger}`;
    }
    mollin.log = function (message) {
        document.getElementById("log").innerHTML += message + "<br>";
    }
    mollin.mutate = function () {
        for (const attribute in mollin.attributes) {
            if (Math.floor(Math.random() * 100) <= mollin.attributes.mutateChance) {
                mollin.log("Mutated.");
                console.log(`Mutating: ${attribute}`);
                if (typeof mollin.attributes[attribute] === 'number' && attribute !== 'age' && attribute !== 'health') {
                    const random = Math.ceil(Math.random() * 10);
                    let change = 1;
                    if (random <= 1) {
                        change = 4;
                    } else if (random <= 2) {
                        change = 2.5;
                    } else if (random <= 3) {
                        change = 2;
                    } else if (random <= 5) {
                        change = 1.5;
                    }

                    if (Math.floor(Math.random() * 2)) {
                        mollin.attributes[attribute] += change;
                    } else {
                        mollin.attributes[attribute] -= change;
                    }
                }
            }

        }
    }
    mollin.saveGame = function () {
        const saveData = {
            attributes: mollin.attributes,
            status: mollin.status
        };
        localStorage.setItem("mollinSave", JSON.stringify(saveData));
        console.log("Saved game in localStorage as JSON object.")
    }

    document.getElementById("increaseTemp").addEventListener("click", function () {
        mollin.status.temp += 1;
        mollin.updateUI();
    });
    document.getElementById("decreaseTemp").addEventListener("click", function () {
        mollin.status.temp -= 1;
        mollin.updateUI();
    });
    document.getElementById("feedMollin").addEventListener("click", function () {
        mollin.status.hunger += 1;
        mollin.updateUI();
    });
    document.getElementById("pause").addEventListener("click", function () {
        if (mollin.paused) {
            mollin.paused = false;
            mollin.log("Resumed.");
            document.getElementById("mollinSleeping").style.display = 'none';
            document.getElementById("mollinAlive").style.display = 'inline-block';
        } else {
            mollin.paused = true;
            mollin.log("Paused.");
            document.getElementById("mollinSleeping").style.display = 'inline-block';
            document.getElementById("mollinAlive").style.display = 'none';
        }
    });

    let notExtinct = true;



    mollin.simulate = async function () {
        while (notExtinct) {
            while (mollin.paused) {
                await sleep(500);
            }

            mollin.status.age++;
            mollin.updateUI();
            await sleep(mollin.tickSpeed);

            if (Math.ceil(Math.random() * 100) < mollin.attributes.foodChance) {
                mollin.status.hunger += Math.ceil(Math.random() * (mollin.attributes.foodChance / 10 + 1));
                mollin.log("Found food.");
            }

            if (mollin.status.health > mollin.attributes.maxHealth) {
                mollin.status.health -= 5;  
            }

            if (mollin.status.hunger > mollin.attributes.maxHunger) {
                mollin.status.hunger = mollin.attributes.maxHunger;
            }

            if (mollin.status.health < mollin.attributes.maxHealth / 2) {
                switchMusic("danger");

            } else if (mollin.status.health >= mollin.attributes.maxHealth / 2) {
                switchMusic("mainTheme");
            }

            if (mollin.status.hunger > mollin.attributes.maxHunger / 4 && mollin.status.age > 1) {
                mollin.status.hunger -= mollin.attributes.maxHunger / 4;
                mollin.status.health += (mollin.attributes.maxHunger / 4) / 2;
            }

            if (Math.floor(Math.random() * 2)) {
                mollin.status.temp += 1;
                console.log("Increasing temperature.");
            } else {
                mollin.status.temp -= 1;
                console.log("Decreasing temperature.");
            }
            if (mollin.status.temp > mollin.attributes.maxTemp) {
                mollin.status.health -= (mollin.status.temp - mollin.attributes.maxTemp) / 2;
                mollin.status.temp -= 0.5;
            } else if (mollin.status.temp < mollin.attributes.minTemp) {
                mollin.status.health -= (mollin.attributes.minTemp - mollin.status.temp) / 2;
                mollin.status.temp += 0.5;
            }
            if (mollin.status.age >= mollin.attributes.lifetime / 2 && mollin.status.age <= mollin.attributes.lifetime / 4 * 3 && mollin.status.hunger >= mollin.attributes.maxHunger / 2) {
                mollin.status.age = 0;
                mollin.status.hunger = Math.round(mollin.status.hunger / 2);
                mollin.status.health = Math.round(mollin.status.health / 4 * 3);
                mollin.status.generation++;
                mollin.mutate();
                mollin.saveGame();
                mollin.log("The Mollin has reproduced and a new generation begins.");
                continue
            } else if (mollin.status.age >= mollin.attributes.lifetime) {
                mollin.log("The Mollin reached the end of it's lifetime before having enough food to reproduce.");
                document.getElementById("mollinAlive").style.display = 'none';
                document.getElementById("mollinDead").style.display = 'inline-block';
                mollin.updateUI();
                mollin.log("Extinction.");
                localStorage.removeItem("mollinSave");
                document.getElementById("inputs-container").style.display = 'inline-block';
                break;
            }
            if (mollin.status.health <= 0) {
                if (mollin.status.age >= mollin.attributes.lifetime / 4) {
                    mollin.status.generation--;
                    mollin.status.health = mollin.attributes.maxHealth / 2;
                    mollin.status.age = 0;
                    mollin.log("The Mollin died but it's parent generation continues.");
                    mollin.updateUI();
                    await sleep(mollin.tickSpeed);
                    continue;
                } else {
                    document.getElementById("mollinAlive").style.display = 'none';
                    document.getElementById("mollinDead").style.display = 'inline-block';
                    mollin.updateUI();
                    mollin.log("Extinction.");
                    localStorage.removeItem("mollinSave");
                    document.getElementById("inputs-container").style.display = 'inline-block';
                    break;
                }
            }


        }
    }


}

let mollin;

document.getElementById("startButton").addEventListener("click", function () {

    document.getElementById("log").innerHTML = "";
    const values = {
        maxHealth: Number(document.getElementById("maxHealthInput").value),
        maxTemp: Number(document.getElementById("maxTempInput").value),
        minTemp: Number(document.getElementById("minTempInput").value),
        lifetime: Number(document.getElementById("lifetimeInput").value),
        maxHunger: Number(document.getElementById("maxHungerInput").value),
        foodChance: Number(document.getElementById("foodChanceInput").value)
    }

    if (values.maxHealth < 1) {
        alert("Maximum Health must be at least 1.");
    } else if (values.maxTemp <= values.minTemp) {
        alert("Maximum Temperature must be greater than Minimum Temperature.");
    } else if (values.lifetime < 1) {
        alert("Lifetime must be at least 1.");
    } else if (values.maxHunger < 1) {
        alert("Maximum Hunger must be at least 1.");
    } else if (values.foodChance < 1 || values.foodChance > 100) {
        alert("Food Chance must be between 1 and 100.");
    } else {
        document.getElementById("mollinAlive").style.display = 'inline-block';
        document.getElementById("mollinSleeping").style.display = 'none';
        document.getElementById("inputs-container").style.display = 'none';
        this.style.display = 'none';
        mollin = new Mollin(values.maxHealth, values.maxTemp, values.minTemp, values.lifetime, values.maxHunger, 5, values.foodChance);
        mollin.simulate();
    }

}
);

document.getElementById("restartScreen").addEventListener("click", function () {
    document.getElementById("verifyRestart").style.display = 'inline-block';
});

document.getElementById("cancelButton").addEventListener("click", function () {
    document.getElementById("verifyRestart").style.display = 'none';
});

document.getElementById("restartButton").addEventListener("click", function () {
    localStorage.removeItem("mollinSave");
    location.reload();
});

let menuVisible = false;

document.getElementById("menuIcon").addEventListener("click", function () {
    if (menuVisible) {
        document.getElementById("settingsMenu").style.display = 'none';
        if (Number(document.getElementById("tickSpeed").value) != false) {
            localStorage.setItem("tickSpeed", Number(document.getElementById("tickSpeed").value) * 1000);
            mollin.tickSpeed = Number(document.getElementById("tickSpeed").value) * 1000;
        }
        if (document.getElementById("audioToggleOn").style.display == 'inline-block') {
            localStorage.setItem("audioEnabled", "true");
        } else {
            localStorage.setItem("audioEnabled", "false");
        }
        menuVisible = false;
    } else {
        document.getElementById("settingsMenu").style.display = 'block';
        menuVisible = true;
    }
});

document.getElementById("randomizeInputs").addEventListener("click", function () {
    const maxTemp = Math.ceil(Math.random() * 150);
    document.getElementById("maxHealthInput").value = Math.ceil(Math.random() * 80);
    document.getElementById("maxTempInput").value = maxTemp;
    document.getElementById("minTempInput").value = Math.ceil(Math.random() * (maxTemp - 10));
    document.getElementById("lifetimeInput").value = Math.ceil(Math.random() * 400);
    document.getElementById("maxHungerInput").value = Math.ceil(Math.random() * 80);
    document.getElementById("foodChanceInput").value = Math.ceil(Math.random() * 99);
});

document.getElementById("audioToggleOff").addEventListener("click", function () {
    playMusic = true
    document.getElementById("music").play().catch(() => { });
    document.getElementById("audioToggleOff").style.display = 'none';
    document.getElementById("audioToggleOn").style.display = 'inline-block';

});
document.getElementById("audioToggleOn").addEventListener("click", function () {
    playMusic = false;
    document.getElementById("music").pause();
    document.getElementById("audioToggleOff").style.display = 'inline-block';
    document.getElementById("audioToggleOn").style.display = 'none';
});

window.addEventListener("load", function () {
    this.document.getElementById("loadingScreen").style.display = 'none';
    saveData = getSave(false);
    tickSpeed = Number(localStorage.getItem("tickSpeed"));
    audioEnabled = localStorage.getItem("audioEnabled");
    if (saveData) {
        document.getElementById("mollinAlive").style.display = 'inline-block';
        document.getElementById("mollinSleeping").style.display = 'none';
        document.getElementById("mollinDead").style.display = 'none';
        document.getElementById("inputs-container").style.display = 'none';
        document.getElementById("startButton").style.display = 'none';
        mollin = new Mollin(saveData.attributes.maxHealth, saveData.attributes.maxTemp, saveData.attributes.minTemp, saveData.attributes.lifetime, saveData.attributes.maxHunger, saveData.attributes.mutateChance, saveData.attributes.foodChance, saveData.status.generation);
        if (tickSpeed) {
            mollin.tickSpeed = tickSpeed;
            document.getElementById("tickSpeed").value = tickSpeed / 1000;
        }
        if (audioEnabled == "true") {
            playMusic = true;
            document.getElementById("audioToggleOff").style.display = 'none';
            document.getElementById("audioToggleOn").style.display = 'inline-block';
        } else {
            playMusic = false;
            document.getElementById("audioToggleOff").style.display = 'inline-block';
            document.getElementById("audioToggleOn").style.display = 'none';
        }
        mollin.simulate();
    }
});
