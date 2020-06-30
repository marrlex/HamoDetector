const noteNames = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const freqRatio = {
    major: [1, 25/24, 9/8, 6/5, 5/4, 4/3, 25/18, 3/2, 25/16, 5/3, 9/5, 15/8, 2],
    minor: [1, 27/25, 9/8, 6/5, 5/4, 4/3, 36/25, 3/2, 8/5, 5/3, 9/5, 15/8, 2],
}


const chords = [
    {
        notes: new Set([0, 4, 7]),
        name: "",
    },
    {
        notes: new Set([0, 3, 7]),
        name: "m",
    },
    {
        notes: new Set([0, 5, 7]),
        name: "sus4"
    },
    {
        notes: new Set([0, 2, 7]),
        name: "sus2"
    },
    {
        notes: new Set([0, 4, 8]),
        name: "aug"
    },
    {
        notes: new Set([0, 3, 6]),
        name: "dim"
    },
    {
        notes: new Set([0, 4, 7, 10]),
        name: "7"
    },
    {
        notes: new Set([0, 3, 7, 10]),
        name: "m7"
    },
    {
        notes: new Set([0, 4, 7, 11]),
        name: "M7"
    },
    {
        notes: new Set([0, 3, 6, 10]),
        name: "m7-5"
    },
    {
        notes: new Set([0, 5, 7, 10]),
        name: "7suss4"
    },
    {
        notes: new Set([0, 3, 7, 11]),
        name: "mM7",
    },
    {
        notes: new Set([0, 4, 7, 9]),
        name: "6"
    },
    {
        notes: new Set([0, 3, 7, 9]),
        name: "m6"
    },
    {
        notes: new Set([0, 4, 6, 10]),
        name: "7-5"
    },
]

function isSuperset(set: Set<number>, subset: Set<number>) {
    for (const elem of subset) {
        if (!set.has(elem)) {
            return false;
        }
    }
    return true;
}

export function getFreqByMidiNoteNumber({
    midiNoteNumber = 21,
    isMajor = true,
    scaleKeyNumber = -1,
    stdFreq = 442
}) {
    const midiNoteNumberOfA0 = 21
    const baseFreq = stdFreq / (2 ** 3)
    if (scaleKeyNumber < 0) {
        return baseFreq  * (2 ** ((midiNoteNumber - midiNoteNumberOfA0) / 12))
    } else {
        const baseMidiNoteNumber = scaleKeyNumber + midiNoteNumberOfA0
        const degree = (midiNoteNumber - baseMidiNoteNumber) % 12;
        const currentFreqRatio = freqRatio[isMajor ? "major" : "minor"];
        const referFreq = baseFreq * (2 ** (scaleKeyNumber / 12));
        const octave = Math.floor(midiNoteNumber / 12) - 2;
        const octaveCorrect = (midiNoteNumber % 12 + 3 < scaleKeyNumber) ? 1 : 0
        return (referFreq * currentFreqRatio[degree]) * 2 ** (octave - octaveCorrect)
    }
}

export function chordCheck(playingMidiNoteNumbers: number[]) {
    const midiNoteNumbers = [...playingMidiNoteNumbers]
    midiNoteNumbers.sort((a, b) => {
        return (a > b) ? 1 : -1
    });
    const toneNumbersInC = [...new Set(midiNoteNumbers.map((value) => value % 12))]
    const toneDistance = (base: number, higher: number) => {
        return (higher > base) ? higher - base : (12 + higher - base) % 12
    }
    const result = [];
    for (let i = 0; i < toneNumbersInC.length; i++) {
        const distances: Set<number> = new Set()
        for (let j = 0; j < toneNumbersInC.length; j++) {
            distances.add(toneDistance(toneNumbersInC[0], toneNumbersInC[j]))
        }
        const matchChords = chords.filter((chord) => isSuperset(distances, chord.notes))
        for (const matchChord of matchChords) {
            result.push({
                scaleName: noteNames[toneNumbersInC[0]],
                chordName: matchChord.name,
                isMajor: !distances.has(3)
            });
        }
        toneNumbersInC.push(toneNumbersInC[0])
        toneNumbersInC.shift()
    }
    return result
}

