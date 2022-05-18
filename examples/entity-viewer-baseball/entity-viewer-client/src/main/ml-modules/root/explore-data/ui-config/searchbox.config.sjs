const searchboxConfig  = {  

    // Application searchbox
    searchbox: {
        "items": [
            {
                "label": "All Entities",
                "value": ["team", "player", "event"],
                "default": true
            },
            {
                "label": "Team",
                "value": "team"
            },
            {
                "label": "Player",
                "value": "player"
            },
            {
                "label": "Event",
                "value": "event"
            }
        ]
    }
};

module.exports = searchboxConfig;
