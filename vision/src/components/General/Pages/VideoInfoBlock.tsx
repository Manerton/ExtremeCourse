import { Button } from "react-bootstrap";

const VideoInfoBlock: React.FC = () => {
    return (
        <section className="mt-4 mb-4 py-3">
            <div className="d-flex flex-column flex-md-row gap-3 justify-content-center">

                {/* Блок с инструкцией */}
                <div className="border rounded p-3 text-center flex-fill">
                    <h4>Нужна помощь?</h4>
                    <p>Посмотрите короткое видео с инструкцией</p>

                    <Button
                        variant="info"
                        size="lg"
                        onClick={() => window.open("https://disk.yandex.ru/i/WTn4PNPzL_P0sw", "_blank")}
                    >
                        Смотреть видео
                    </Button>
                </div>

            </div>
        </section>
    )
}

export default VideoInfoBlock;