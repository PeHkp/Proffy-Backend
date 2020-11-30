export default function ConvertHoursToMinutes(time:string) {

    const [h,m] = time.split(":").map(Number)

    const timeInMinute = (h*60) + m

    return timeInMinute
}