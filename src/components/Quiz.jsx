"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion } from "framer-motion"
import { BookOpen, Brain, Loader2, RefreshCw, Rocket, Trophy } from "lucide-react"

const interests = [
  { id: "javascript", name: "JavaScript", icon: <BookOpen className="h-5 w-5" /> },
  { id: "react", name: "React", icon: <Rocket className="h-5 w-5" /> },
  { id: "node", name: "Node.js", icon: <Brain className="h-5 w-5" /> },
  { id: "css", name: "CSS", icon: <BookOpen className="h-5 w-5" /> },
  { id: "html", name: "HTML", icon: <BookOpen className="h-5 w-5" /> },
  { id: "typescript", name: "TypeScript", icon: <BookOpen className="h-5 w-5" /> },
]

function Quiz() {
  const [questions, setQuestions] = useState([])
  const [userAnswers, setUserAnswers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [showQuiz, setShowQuiz] = useState(false)
  const [selectedInterests, setSelectedInterests] = useState([])
  const [quizType, setQuizType] = useState("random")
  const [score, setScore] = useState(null)

  const fetchQuestions = async (interestIds = []) => {
    setIsLoading(true)
    setError("")
    try {
      const response = await axios.get(`${import.meta.env.VITE_URL}/quiz`, {
        params : { interests : interestIds},
        withCredentials: true,
      })
      setQuestions(response.data.quiz)
    } catch (err) {
      setError("Failed to load quiz data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (questions.length > 0) {
      setUserAnswers(new Array(questions.length).fill(""))
    }
  }, [questions])

  const handleAnswerChange = (index, event) => {
    const updatedAnswers = [...userAnswers]
    updatedAnswers[index] = event.target.value
    setUserAnswers(updatedAnswers)
  }

  const calculateScore = async () => {
    let calculatedScore = 0
    questions.forEach((question, index) => {
      if (userAnswers[index] === question.answer) {
        calculatedScore++
      }
    })

    setScore(calculatedScore)

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_URL}/quiz/marks`,
        { score: calculatedScore },
        { withCredentials: true },
      )
      setIsSubmitted(true)
      if (response.data.success) {
        toast.success(response.data.message)
      } else {
        toast.error(response.data.message)
      }
    } catch (err) {
      toast.error(err.message)
    }
  }

  const startQuiz = () => {
    if (quizType === "interests" && selectedInterests.length === 0) {
      toast.error("Please select at least one interest")
      return
    }

    fetchQuestions(quizType === "interests" ? selectedInterests : [])
    setShowQuiz(true)
  }

  const resetQuiz = () => {
    setShowQuiz(false)
    setQuestions([])
    setUserAnswers([])
    setIsSubmitted(false)
    setScore(null)
    setSelectedInterests([])
  }

  const toggleInterest = (interestId) => {
    if (selectedInterests.includes(interestId)) {
      setSelectedInterests(selectedInterests.filter((id) => id !== interestId))
    } else {
      setSelectedInterests([...selectedInterests, interestId])
    }
  }

  // Landing page UI
  if (!showQuiz) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex flex-col items-center justify-center py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-4xl"
        >
          <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-md">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold text-white mb-2">Knowledge Quest</CardTitle>
              <CardDescription className="text-lg text-white/80">
                Test your skills and challenge yourself with our interactive quizzes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="random" className="w-full" onValueChange={setQuizType}>
                <TabsList className="grid w-full grid-cols-2 mb-8">
                  <TabsTrigger value="random">Random Quiz</TabsTrigger>
                  <TabsTrigger value="interests">Interest-Based Quiz</TabsTrigger>
                </TabsList>
                <TabsContent value="random" className="text-center">
                  <div className="p-6 rounded-lg bg-white/5 mb-6">
                    <Rocket className="h-16 w-16 mx-auto mb-4 text-white" />
                    <h3 className="text-xl font-semibold text-white mb-2">Random Challenge</h3>
                    <p className="text-white/80">
                      Test your knowledge with a variety of questions from different topics
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="interests">
                  <div className="p-6 rounded-lg bg-white/5 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-4">Select Your Interests</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interests.map((interest) => (
                        <div
                          key={interest.id}
                          onClick={() => toggleInterest(interest.id)}
                          className={`p-4 rounded-lg cursor-pointer transition-all flex items-center gap-3 ${
                            selectedInterests.includes(interest.id)
                              ? "bg-white/30 shadow-lg"
                              : "bg-white/10 hover:bg-white/20"
                          }`}
                        >
                          {interest.icon}
                          <span className="text-white font-medium">{interest.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button
                size="lg"
                onClick={startQuiz}
                className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white border-0 px-8 py-6 text-lg"
              >
                Start Quiz
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  // Quiz UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-700 flex flex-col items-center justify-center py-8 px-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-4xl">
        <Card className="border-0 shadow-2xl overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <div className="flex justify-between items-center">
              <CardTitle className="text-3xl font-bold">React Quiz</CardTitle>
              {quizType === "interests" && selectedInterests.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedInterests.map((interest) => {
                    const interestObj = interests.find((i) => i.id === interest)
                    return (
                      <Badge key={interest} className="bg-white/20 text-white/90">
                        {interestObj?.name}
                      </Badge>
                    )
                  })}
                </div>
              )}
            </div>
            <CardDescription className="text-white/80">
              Test your knowledge with these challenging questions
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mb-4" />
                <p className="text-xl text-gray-700">Loading your quiz...</p>
              </div>
            ) : error ? (
              <div className="text-red-600 text-xl bg-red-50 p-6 rounded-lg">
                <p>{error}</p>
                <Button onClick={resetQuiz} variant="outline" className="mt-4">
                  Go Back
                </Button>
              </div>
            ) : (
              <div className="space-y-8">
                {questions.map((q, index) => (
                  <div key={index} className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="h-8 w-8 rounded-full flex items-center justify-center p-0 text-lg font-semibold"
                      >
                        {index + 1}
                      </Badge>
                      <h3 className="text-xl font-semibold text-gray-800">{q.question}</h3>
                    </div>

                    <RadioGroup
                      value={userAnswers[index]}
                      onValueChange={(value) => handleAnswerChange(index, { target: { value } })}
                      className="space-y-3"
                    >
                      {q.options.map((option, optionIndex) => (
                        <div
                          key={optionIndex}
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                            isSubmitted
                              ? userAnswers[index] === option
                                ? option === q.answer
                                  ? "bg-green-50 border-green-200"
                                  : "bg-red-50 border-red-200"
                                : option === q.answer
                                  ? "bg-green-50 border-green-200"
                                  : "bg-white border-gray-200"
                              : userAnswers[index] === option
                                ? "bg-purple-50 border-purple-200"
                                : "bg-white border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          <RadioGroupItem value={option} id={`option-${index}-${optionIndex}`} disabled={isSubmitted} />
                          <Label
                            htmlFor={`option-${index}-${optionIndex}`}
                            className={`w-full cursor-pointer text-lg ${
                              isSubmitted
                                ? userAnswers[index] === option
                                  ? option === q.answer
                                    ? "text-green-700 font-medium"
                                    : "text-red-700 font-medium"
                                  : option === q.answer
                                    ? "text-green-700 font-medium"
                                    : "text-gray-700"
                                : "text-gray-700"
                            }`}
                          >
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            )}
          </CardContent>

          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50 p-6">
            {isSubmitted && score !== null && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow">
                <Trophy className="h-5 w-5 text-yellow-500" />
                <span className="font-semibold">
                  Score: {score}/{questions.length}
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={resetQuiz} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                New Quiz
              </Button>

              <Button
                onClick={calculateScore}
                disabled={isSubmitted || isLoading || userAnswers.includes("")}
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
              >
                {isSubmitted ? "Submitted" : "Submit Answers"}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

export default Quiz
