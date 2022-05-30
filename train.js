function preset() {
    let episodeCount = document.getElementById("episodeCountInput").value;
    let timeLimit = document.getElementById("timeLimitInput").value;

    document.getElementById("trainStats").style.display="inline"
    document.getElementById("episodeCounter").innerHTML = episodeCount;
    document.getElementById("timeLimit").innerHTML = timeLimit;

    train(episodeCount, timeLimit);
}

function train(episodeCount, timeLimit) {
    for(let i=0; i<episodeCount; i++) {
        //reset env
        for(let j=0; j<timeLimit; j++) {
            //set env
            //get action from model
            //store prev inputs
            //observation, reward, done, info = env.step(action)

            //Keep a store of the agent's experiences
            model.remember(done, action, observation, prev_obs)
            model.experience_replay(20)
            //epsilon decay
        }
    }
}
