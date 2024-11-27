import { default as axios, default as unAuthAxios } from 'axios'
import { defineStore } from 'pinia'
import { Notify } from 'quasar'
import axiosBaseUrl from 'src/utils/auth'
import authUserPortal from 'src/utils/authUserPortal'
import challengeAuth from 'src/utils/challengeAuth'
import provisionAuth from 'src/utils/provisionAuth'
import quizUrl from 'src/utils/quizUrl'
import { convertJsonToFormData, urlSafeBase64Encode } from 'src/utils/reuseFunctions'
export const useTestStore = defineStore('test', {
  state: () => ({
    _isLoading: false,
    _iisLoading: false,
    _labInfo: {},
    _labInstructions: {},
    _runningLabInfo: {},
    _quizAnswersResponse: {},
    _quizData: [],
    assignedTestInfo: {},
    assignedTestsResponse: [],
    challengeCode: {},
    challengeInfo: {},
    challengesTestsResponse: {},
    getSolution: {},
    startExamResponse: {},
    recordVideoId: '',
    recordedDuration: '',
    test_id: '',
    getQuizAnswer: [],
    video_uuid: '',
    fileUrl: '',
    forceStop: false
  }),

  getters: {
    getAssignedTestsResponse: (state) => state.assignedTestsResponse,
    getChallengeCode: (state) => state.challengeCode,
    getChallengesTestsResponse: (state) => state.challengesTestsResponse,
    getDetailedRunningExam: (state) => state.assignedTestInfo,
    getLabInfo: (state) => state._labInfo,
    getLabInstructions: (state) => state._labInstructions,
    getQuizAnswersResponse: (state) => state._quizAnswersResponse,
    getQuizData: (state) => state._quizData,
    getStartExamResponse: (state) => state.startExamResponse,
    isLoading: (state) => state._isLoading,
    videoPreviewUrl: (state) => state.recordVideoId,
    video_id: (state) => state.video_uuid,
    videoUrl: (state) => state.fileUrl,
    forceStopState: (state) => state.forceStop
  },
  actions: {
    resetQuizAnswersResponse() {
      this.getQuizAnswer = []
    },

    SET_IS_LOADING(data) {
      this._iisLoading = data
    },
    async fetchStartExam(payload) {
      this._isLoading = true
      await axiosBaseUrl
        .post('consumer/test/start', payload)
        .then((response) => this.$patch({ startExamResponse: response }))
        .finally(() => (this._isLoading = false))
    },

    async fetchIndividualTestInfo(payload) {
      this._isLoading = true
      await axiosBaseUrl
        .post('consumer/test', payload)
        .then((res) => {
          this.test_id = res.data.data.sk
          if (res.data.success) {
            this.$patch({ assignedTestInfo: res.data.data })
          }
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchAssignedChallenges(payload) {
      this.test_id = payload.test
      let resetData = false
      if (payload.reset) {
        resetData = payload.reset
      }
      delete payload.reset
      // if (!payload.test.startsWith('test_')) {
      //   payload.test = 'test_' + payload.test
      // }
      this._isLoading = true
      await axiosBaseUrl
        .post('consumer/test/list', payload)
        .then((response) => {
          let result = resetData ? response.data.data : (this.challengesTestsResponse.data || []).concat(response.data.data)
          this.challengesTestsResponse = {
            data: result || [],
            pagination: response.data.data.last_value || {}
          }
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchLabInfo(payload) {
      this._isLoading = true
      await axiosBaseUrl
        .post('consumer/lab', payload)
        .then((res) => this.$patch({ _labInfo: res.data.data }))
        .finally(() => (this._isLoading = false))
    },

    async fetchLabInfoData(payload) {
      this._isLoading = true
      await axiosBaseUrl
        .post('consumer/user-running-lab', payload, { crossDomain: true })
        .then((res) => {
          let labDataDict = {}
          if (Object.keys(res.data.data).length > 0) {
            labDataDict = {
              name: res.data.data.lab_name,
              id: res.data.data.sk,
              lab_id: urlSafeBase64Encode(res.data.data.sk),
              is_alive: res.data.data.is_active,
              dns_entry: 'https://' + res.data.data.dns_entry,
              dns_pass_entry: res.data.data.dns_entry,
              ipv4: res.data.data.ipv4,
              region: res.data.data.region,
              password: res.data.data.password,
              running_ttl: res.data.data.running_ttl,
              created_on: res.data.data.created_on,
              port_map: res.data.data.port_map,
              running_instance_id: res.data.data.pk,
              instance_id: res.data.data.sk,
              challenge_id: res.data.data.challenge_id || '',
              url_badge: res.data.data.url || ''
            }
            if (res.data.data.is_cloud) {
              labDataDict.ou_id = res.data.data.ou_id
              labDataDict.cloud_type = res.data.data.cloud_type
              labDataDict.is_cloud = res.data.data.is_cloud
              labDataDict.challenge_id = res.data.data.challenge_id || ''
            }
          } else {
            labDataDict = {
              name: res.data.data.lab_name,
              event_id: res.data.data.event_id,
              id: res.data.data.sk,
              lab_id: urlSafeBase64Encode(res.data.data.sk),
              description: res.data.data.description,
              regions: res.data.data.regions,
              challenge_id: res.data.data.challenge_id || '',
              url_badge: res.data.data.url || '',
              is_alive: false
            }
            if (res.data.data.is_cloud) {
              labDataDict.ou_id = res.data.data.ou_id
              labDataDict.cloud_type = res.data.data.cloud_type
              labDataDict.is_cloud = res.data.data.is_cloud
            }
          }
          this.$patch({ _runningLabInfo: labDataDict })
        })
        .catch(() => this.$patch({ _runningLabInfo: {} }))
        .finally(() => (this._isLoading = false))
    },

    async fetchChallengeData(payload) {
      this._isLoading = true
      await challengeAuth
        .post('consumer/get-challenge', payload)
        .then((res) => {
          if (res.data.success) {
            this.$patch({ challengeInfo: res.data.data })
          }
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchChallengeSolution(payload) {
      this._isLoading = true
      await challengeAuth
        .post('consumer/get-solution', payload)
        .then((res) => {
          if (res.data.success) {
            this.$patch({ getSolution: res.data })
          }
        })
        .catch((error) => {
          if (typeof error.response.data.message === 'string') {
            Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
          }
        })
        .finally(() => (this._isLoading = false))
    },

    async getMarkdownData(url) {
      try {
        return await unAuthAxios.get(url, {
          headers: {
            'Content-Type': 'text/markdown'
          }
        })
      } catch (err) {
        console.error(err)
      }
    },

    async deleteLabServer(payload) {
      this._isLoading = true
      await provisionAuth
        .post('provision/delete-server', payload)
        .catch((error) => {
          if (typeof error.response.data.message === 'string') {
            Notify.create({ type: 'negative', position: 'top', progress: true, icon: 'warning', message: error.response.data.message })
          }
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchVerifyLabAction(payload) {
      this._isLoading = true
      await challengeAuth
        .post('consumer/verify-challenge', payload)
        .then((res) => {
          if (res.data.success) {
            this.challengeCode = res.data.data
          }
        })
        .catch(() => {
          this.challengeCode = {}
        })
        .finally(() => (this._isLoading = false))
    },

    async fetchLabInstruction(payload) {
      this._isLoading = true
      await authUserPortal
        .post('lab/instruction', payload)
        .then((response) => this.$patch({ _labInstructions: response.data.data }))
        .finally(() => (this._isLoading = false))
    },

    async startProvisioner(payload) {
      this._isLoading = true
      return await provisionAuth
        .post('provision/start-server', payload)
        .then(async (res) => res.data)
        .catch(async (error) => error)
        .finally(() => (this._isLoading = false))
    },

    async progressProvisioner(payload) {
      this._isLoading = true
      return await provisionAuth
        .post('provision/get-progress', payload)
        .then(async (res) => res.data)
        .catch(async (error) => error)
        .finally(() => (this._isLoading = false))
    },

    async fetchAssignedTestsInfo(payload) {
      let resetData = false
      if (payload.reset) {
        resetData = payload.reset
      }
      delete payload.reset
      this._isLoading = true
      await axiosBaseUrl
        .post('consumer/test-assign/list', payload)
        .then((response) => {
          let result = []
          if (resetData) {
            result = response.data.data
          } else {
            result = this.assignedTestsResponse.data ? this.assignedTestsResponse.data.concat(response.data.data) : response.data.data
          }
          this.assignedTestsResponse = {
            data: result || [],
            pagination: response.data.last_value || {}
          }
        })
        .finally(() => (this._isLoading = false))
    },

    async answerDescriptiveQuestion(payload) {
      this._isLoading = true
      await axiosBaseUrl
        .post('consumer/submit-answer', payload)
        .then((res) => {
          Notify.create({ message: res.data.message, color: 'green', position: 'top' })
          const question = this.challengesTestsResponse.data.questions.find((question) => question.sk === payload.question_id)
          if (question) {
            question.attempted = true
            question.answer = payload.answer
          }
        })
        .catch((error) => {
          console.error(error)
          Notify.create({ message: error?.response?.data?.message || error, color: 'red', position: 'top' })
        })
        .finally(() => (this._isLoading = false))
    },

    async meetReference(payload) {
      this._isLoading = true
      await axiosBaseUrl
        .post('consumer/meet-ref', payload)
        .then((res) => {
          console.log(res.data)
          this._isLoading = false
        })
        .catch((error) => console.error(error))
    },

    async endTest(payload) {
      this._iisLoading = true
      try {
        const response = await axiosBaseUrl.post('consumer/test/end', payload)
        this._iisLoading = false
        if (response.status === 200) {
          return response.status
        } else {
          Notify.create({
            type: 'negative',
            position: 'top',
            progress: true,
            message: 'Please try again later',
            timeout: 1100,
            icon: 'warning'
          })
        }
      } catch (error) {
        console.error(error)
      } finally {
        this._iisLoading = false
      }
    },

    async viewStatus(payload) {
      this._iisLoading = true
      try {
        const response = await axiosBaseUrl.post('consumer/view-status', payload)
        this._iisLoading = false
        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        this._iisLoading = false
      }
    },

    async getUrl(payload) {
      // get API after hitting consumer/attachment
      this._iisLoading = true
      try {
        const response = await axiosBaseUrl.post('consumer/attachment', payload)
        this._iisLoading = false
        return response.data
      } catch (error) {
        console.error(error)
      } finally {
        this._iisLoading = false
      }
    },
    async fileUpload({ signedUrl, form }) {
      this._iisLoading = true
      await axios
        .post(signedUrl, convertJsonToFormData(form), {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        })
        .then((res) => {
          if (res.status === 204) {
            Notify.create({
              type: 'positive',
              position: 'top',
              progress: true,
              message: 'File uploaded successfully',
              timeout: 1100,
              icon: 'done'
            })
            return res.data
          } else if (res.status >= 400 && res.status <= 499) {
            Notify.create({
              type: 'negative',
              position: 'top',
              progress: true,
              message: 'File uploaded Failed. Please try again later',
              timeout: 1100,
              icon: 'warning'
            })
          } else {
            Notify.create({
              type: 'negative',
              position: 'top',
              progress: true,
              message: 'Internal server error. please try again later',
              timeout: 1100,
              icon: 'warning'
            })
          }
        })
        .catch((error) => console.error(error))
        .finally(() => {
          this._iisLoading = false
        })
    },
    setVideoUuid(id) {
      this.video_uuid = id
    },
    setFileUrl(url) {
      this.fileUrl = url
    },
    setForceStop(status) {
      this.forceStop = status
    },
    async getRecordState() {
      const url = 'https://api.videosdk.live/v2/recordings?roomId=' + this.video_uuid + '&page=1&perPage=10'
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI5MjYzYzgwNC1iMDQ0LTQ2NGItYmIxZC05MGY5OGFmMjFmMGQiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTY5OTI4NzY4MSwiZXhwIjoxNzMwODIzNjgxfQ.QJFS6Pz3FBqqGT6Wuu7NEPRgu-koUmZgjFGf9tpKxGc'
      await axios
        .get(url, {
          headers: {
            Authorization: token
          }
        })
        .then((response) => {
          this.fileUrl = response.data.data[0].file.fileUrl
        })
        .catch((err) => {
          console.error(err)
        })
    },
    async validateAnswer(payload) {
      this._isLoading = true
      await quizUrl
        .post('evaluate-challenge', payload)
        .then((res) => {
          this._quizAnswersResponse = res.data.data.response
          this._quizData = res.data.data
          // console.log(this._quizData)

          // const question = this._quizData.data.find((question) => question.sk === payload.challenge_id)
          // console.log(question)

          // if (question) {
          //   question.attempted = true
          //   question.answer = payload.answer
          // }
        })
        .catch((error) => {
          console.error(error)
        })
        .finally(() => (this._isLoading = false))
    },

    async validateCodeAnswer(payload) {
      try {
        await quizUrl.post('/validate-code', payload)

        setTimeout(async () => {
          const { data } = await quizUrl.post('/check-progress', payload)
          this.getQuizAnswer = data.data
          if (data.data.status === 'pass') {
            Notify.create({
              type: 'positive',
              position: 'top',
              progress: true,
              message: 'Challenge passed',
              icon: 'done'
            })
          } else {
            Notify.create({
              type: 'negative',
              position: 'top',
              progress: true,
              message: 'Challenge failed',
              icon: 'report_problem'
            })
          }
        }, 10000)
      } catch (err) {
        console.warn(err)
        return false
      } finally {
      }
    }
  }
})
