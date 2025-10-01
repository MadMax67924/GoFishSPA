export class ContentModerator {
    constructor() {
        this.profanityList = this.loadProfanityList()
        this.racistTerms = this.loadRacistTerms()
        this.threatPatterns = this.loadThreatPatterns()
    }

    loadProfanityList() {
        return [
            'palabra1', 'palabra2', 'palabra3',
            'mierda', 'carajo', 'coño', 'joder', 'puta', 'cabrón',
            'pendejo', 'verga', 'culiao', 'weón', 'conchetumare'
        ]
    }

    loadRacistTerms() {
        return [
            'negro de mierda', 'indio', 'sudaca', 'moro',
            'gitano ladrón', 'chino de mierda'
        ]
    }

    loadThreatPatterns() {
        return [
            /te voy a matar/i,
            /te voy a golpear/i,
            /voy a quemar/i,
            /te juro que/i,
            /te vas a arrepentir/i
        ]
    }

    analyzeText(text) {
        const lowerText = text.toLowerCase()
        const analysis = {
            profanityCount: 0,
            racistTerms: [],
            threats: [],
            inappropriate: false,
            score: 0,
            reasons: []
        }

        //Detecta si el texto cuenta con palabras dentro de la profanityList
        this.profanityList.forEach(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'gi')
            const matches = lowerText.match(regex)
            if (matches) {
                analysis.profanityCount += matches.length
                analysis.reasons.push(`Lenguaje vulgar: "${word}"`)
            }
        })

        //Detecta si el texto cuenta con palabras dentro de la lista de terminos racistas
        this.racistTerms.forEach(term => {
            if (lowerText.includes(term)) {
                analysis.racistTerms.push(term)
                analysis.reasons.push(`Término discriminatorio: "${term}"`)
            }
        })

        //Detecta si el texto cuenta con palabras dentro de la lista de patrones de amenaza
        this.threatPatterns.forEach(pattern => {
            if (pattern.test(text)) {
                analysis.threats.push(pattern.source)
                analysis.reasons.push('Posible amenaza detectada')
            }
        })

        //Detecta si el texto cuenta con contenido sexual
        const sexualPatterns = [
            /pornografía|porno|sexo explicito|desnudo|nudes/i,
            /follar|coger|culo|tetas|vagina|pene/i
        ]
        
        sexualPatterns.forEach(pattern => {
            if (pattern.test(text)) {
                analysis.reasons.push('Contenido sexual explícito')
            }
        })

        // Calcular score de riesgo
        analysis.score = this.calculateRiskScore(analysis)
        analysis.inappropriate = analysis.score > 0.6

        return analysis
    }

    calculateRiskScore(analysis) {
        let score = 0
        
        if (analysis.profanityCount > 0) score += 0.3
        if (analysis.racistTerms.length > 0) score += 0.4
        if (analysis.threats.length > 0) score += 0.5
        
        // Limitar a 1.0
        return Math.min(score, 1.0)
    }
}